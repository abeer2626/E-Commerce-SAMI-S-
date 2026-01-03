import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentRulesService } from '@/lib/payment-rules/service';
import type { PaymentMethod, AdvancePaymentRequirement } from '@/lib/payment-rules/types';
import { sendOrderAlert } from '@/lib/whatsapp';

// Validation schema for creating an order
const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

const orderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  total: z.number().positive('Total must be positive'),
  shippingAddress: z.string().min(10, 'Shipping address is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  // Payment method and rules integration
  paymentMethod: z.enum(['COD', 'ADVANCE', 'ONLINE']).optional(),
  advancePaymentRequirement: z
    .object({
      type: z.enum(['PARTIAL', 'FULL']),
      amount: z.number().positive(),
      percentage: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

/**
 * GET /api/orders
 * Fetch orders with optional filters (user, vendor, status)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (vendorId) {
      // Filter orders that contain products from this vendor
      where.orderItems = {
        some: {
          product: {
            vendorId: vendorId,
          },
        },
      };
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order with items and update stock
 * Integrates with payment rules engine to track applied payment rules
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, total, shippingAddress, items, paymentMethod, advancePaymentRequirement } = validation.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify all products exist and have enough stock
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, price: true, vendorId: true, category: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product?.name || 'product'}` },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Extract unique categories from products
    const categories = [...new Set(products.map((p) => p.category))];

    // Build checkout context for payment rules evaluation
    const checkoutContext = {
      orderTotal: total,
      categories,
      user: {
        id: user.id,
        role: user.role as any,
        isAuthenticated: true,
      },
    };

    // Evaluate payment rules
    const paymentEvaluation = await PaymentRulesService.evaluatePaymentMethods(checkoutContext);

    // Validate selected payment method is allowed
    if (paymentMethod) {
      const methodResult = paymentEvaluation.methods[paymentMethod];
      if (methodResult.status === 'RESTRICTED') {
        return NextResponse.json(
          {
            error: `Payment method ${paymentMethod} is not allowed for this order`,
            appliedRules: methodResult.appliedRules,
            suggestion: 'Please evaluate payment methods first using /api/checkout/payment-methods',
          },
          { status: 400 }
        );
      }
    }

    // Create order with items (using transaction)
    const order = await prisma.$transaction(async (tx) => {
      // Create order with payment method
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          total,
          shippingAddress,
          status: 'PENDING',
          paymentMethod: paymentMethod ?? null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create payment record if payment method is specified
      if (paymentMethod && (paymentMethod === 'ADVANCE' || paymentMethod === 'ONLINE')) {
        const advanceAmount = advancePaymentRequirement?.amount ?? total;

        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: advanceAmount,
            status: paymentMethod === 'ONLINE' ? 'pending' : 'pending',
            paymentMethod: paymentMethod,
            advancePayment: advancePaymentRequirement
              ? JSON.stringify({
                  type: advancePaymentRequirement.type,
                  amount: advancePaymentRequirement.amount,
                  percentage: advancePaymentRequirement.percentage,
                })
              : null,
          },
        });
      }

      // Record applied payment rules if a payment method was selected
      if (paymentMethod) {
        await PaymentRulesService.recordAppliedRules(
          newOrder.id,
          paymentEvaluation,
          paymentMethod
        );
      }

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: {
          userId,
          productId: { in: productIds },
        },
      });

      return newOrder;
    });

    // Send WhatsApp alert to admin for new order
    try {
      const orderItems = order.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));

      await sendOrderAlert({
        orderNumber: order.orderNumber,
        customerName: user.name || 'Customer',
        total: order.total,
        items: orderItems,
        paymentMethod: order.paymentMethod || 'COD',
      });
    } catch (whatsappError) {
      // Log error but don't fail the order creation
      console.error('WhatsApp alert failed:', whatsappError);
    }

    return NextResponse.json(
      {
        message: 'Order created successfully',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
          itemCount: order.items.length,
          appliedPaymentRules: paymentEvaluation.methods[paymentMethod || 'COD']?.appliedRules || [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
