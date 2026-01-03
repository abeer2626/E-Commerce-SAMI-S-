import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for creating a payment
const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  stripePaymentId: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).default('pending'),
});

/**
 * GET /api/payments
 * Fetch payments with optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    if (orderId) {
      where.orderId = orderId;
    }

    if (status) {
      where.status = status.toLowerCase();
    }

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.payment.count({ where });

    return NextResponse.json({
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payments.length < total,
      },
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Create a payment record (typically called after Stripe payment)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = paymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { orderId, amount, stripePaymentId, status } = validation.data;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists for this order
    if (order.payment) {
      return NextResponse.json(
        { error: 'Payment already exists for this order' },
        { status: 400 }
      );
    }

    // Verify amount matches order total
    if (Math.abs(amount - order.total) > 0.01) {
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        stripePaymentId,
        status: status || 'pending',
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
    });

    // If payment is completed, update order status
    if (status === 'completed') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });
    }

    return NextResponse.json(
      {
        message: 'Payment created successfully',
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
