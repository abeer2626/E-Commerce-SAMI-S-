import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { generateNewOrderEmail, generateCustomerOrderEmail } from '@/lib/email-templates';

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function sendVendorNotifications(
  order: any,
  cartItems: any[],
  shippingAddress: string,
  customerName: string
) {
  // Get unique vendors from cart items
  const vendorProductMap = new Map<string, any[]>();

  for (const item of cartItems) {
    if (!vendorProductMap.has(item.productId)) {
      vendorProductMap.set(item.productId, []);
    }
    vendorProductMap.get(item.productId)!.push(item);
  }

  // Get vendor information for each product
  const products = await prisma.product.findMany({
    where: {
      id: { in: Array.from(vendorProductMap.keys()) },
    },
    include: {
      vendor: {
        include: {
          user: true,
        },
      },
    },
  });

  // Group items by vendor and send emails
  const vendorGroups = new Map<string, any[]>();

  for (const product of products) {
    const vendorId = product.vendorId;
    if (!vendorGroups.has(vendorId)) {
      vendorGroups.set(vendorId, []);
    }
    const items = vendorProductMap.get(product.id) || [];
    items.forEach((item: any) => {
      vendorGroups.get(vendorId)!.push({
        ...item,
        product: {
          name: product.name,
        },
      });
    });
  }

  // Send email to each vendor
  const platformUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

  for (const [vendorId, items] of vendorGroups.entries()) {
    const vendor = products.find((p) => p.vendorId === vendorId)?.vendor;
    if (!vendor || !vendor.user.email) continue;

    const vendorTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const emailHtml = generateNewOrderEmail({
      vendorName: vendor.businessName,
      orderNumber: order.orderNumber,
      customerName,
      shippingAddress,
      items,
      total: vendorTotal,
      platformUrl,
    });

    await sendEmail({
      to: vendor.user.email,
      subject: `New Order Received - ${order.orderNumber}`,
      html: emailHtml,
    });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { shippingInfo, paymentMethod, cartItems: checkoutItems } = await request.json();

  // Fetch actual cart items with full product details
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const total = cartItems.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );

  // Build shipping address string
  const shippingAddress = `${shippingInfo.fullName}\n${shippingInfo.address}\n${shippingInfo.email}`;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        total,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        status: 'PENDING',
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Create payment record for COD/ADVANCE orders
    if (paymentMethod !== 'ONLINE') {
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          paymentMethod: paymentMethod,
          status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    // Update product stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  // Send vendor email notifications (don't block the response)
  const customerName = shippingInfo.fullName || session.user.name || 'Customer';
  const customerEmail = shippingInfo.email || session.user.email;

  // Send emails in parallel
  Promise.all([
    sendVendorNotifications(order, cartItems, shippingAddress, customerName),
    // Send customer confirmation email
    (async () => {
      if (!customerEmail) return;

      const orderItemsWithProducts = order.items.map((item: any) => ({
        product: { name: item.product.name },
        quantity: item.quantity,
        price: item.price,
      }));

      const emailHtml = generateCustomerOrderEmail({
        customerName,
        orderNumber: order.orderNumber,
        orderId: order.id,
        shippingAddress,
        items: orderItemsWithProducts,
        total,
        platformUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
      });

      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: emailHtml,
      });
    })(),
  ]).catch((error) => {
    console.error('Failed to send email notifications:', error);
  });

  return NextResponse.json({ order });
}
