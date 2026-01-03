import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Initialize Stripe only if API key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 503 }
      );
    }

    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      // Only process if payment is successful
      if (checkoutSession.payment_status === 'paid') {
        const userId = checkoutSession.metadata?.userId;
        const cartItems = JSON.parse(checkoutSession.metadata?.cartItems || '[]');

        if (userId && cartItems.length > 0) {
          // Fetch user details
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          // Group cart items by vendor
          const itemsByVendor: Record<string, any[]> = {};

          for (const cartItem of cartItems) {
            const cartItemData = await prisma.cartItem.findUnique({
              where: { id: cartItem.id },
              include: { product: true },
            });

            if (cartItemData && cartItemData.product) {
              const vendorId = cartItemData.product.vendorId;
              if (!itemsByVendor[vendorId]) {
                itemsByVendor[vendorId] = [];
              }
              itemsByVendor[vendorId].push({
                ...cartItemData,
                quantity: cartItem.quantity,
              });
            }
          }

          // Create orders for each vendor
          const orderPromises = Object.entries(itemsByVendor).map(
            async ([vendorId, items]) => {
              const totalAmount = items.reduce(
                (sum: number, item: any) => sum + item.product.price * item.quantity,
                0
              );

              // Create order
              const order = await prisma.order.create({
                data: {
                  userId: userId,
                  orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                  total: totalAmount,
                  status: 'PROCESSING',
                  shippingAddress: 'TBD', // Webhook orders should have address in metadata
                  items: {
                    create: items.map((item: any) => ({
                      productId: item.productId,
                      quantity: item.quantity,
                      price: item.product.price,
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

              // Update product stock
              for (const item of items) {
                await prisma.product.update({
                  where: { id: item.productId },
                  data: {
                    stock: {
                      decrement: item.quantity,
                    },
                  },
                });
              }

              return order;
            }
          );

          const orders = await Promise.all(orderPromises);

          // Clear the cart
          await prisma.cartItem.deleteMany({
            where: {
              id: { in: cartItems.map((item: any) => item.id) },
              userId: userId,
            },
          });

          // TODO: Send confirmation emails
          // Email functions need to be implemented in lib/email.ts
          console.log(`Created ${orders.length} orders for user ${userId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
