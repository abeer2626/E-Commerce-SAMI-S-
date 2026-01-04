import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

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
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle completed payments
        if (session.payment_status !== 'paid') {
          break;
        }

        // Extract metadata
        const userId = session.metadata?.userId;
        const cartItemsJson = session.metadata?.cartItems;

        if (!userId || !cartItemsJson) {
          console.error('Missing metadata in checkout session');
          break;
        }

        const cartItems = JSON.parse(cartItemsJson);

        // Check if order already exists for this session
        const existingOrder = await prisma.order.findFirst({
          where: {
            orderNumber: `STR-${session.id}`,
          },
        });

        if (existingOrder) {
          console.log('Order already exists for session:', session.id);
          break;
        }

        // Fetch cart items with product details
        const cartItemsWithProducts = await prisma.cartItem.findMany({
          where: {
            id: { in: cartItems.map((item: any) => item.id) },
            userId,
          },
          include: { product: true },
        });

        if (cartItemsWithProducts.length === 0) {
          console.error('No valid cart items found');
          break;
        }

        // Calculate total
        const total = cartItemsWithProducts.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        // Get customer info from session or user
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.error('User not found:', userId);
          break;
        }

        const shippingAddress = session.customer_details?.address
          ? `${session.customer_details.name}\n${session.customer_details.address.line1}\n${session.customer_details.email || user.email}`
          : `${user.name}\n${user.email}`;

        // Create order
        const order = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              orderNumber: `STR-${session.id}`,
              userId,
              total,
              shippingAddress,
              paymentMethod: 'ONLINE',
              status: 'PROCESSING',
              items: {
                create: cartItemsWithProducts.map((item) => ({
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

          // Create payment record
          await tx.payment.create({
            data: {
              orderId: newOrder.id,
              amount: total,
              paymentMethod: 'ONLINE',
              status: 'COMPLETED',
              stripePaymentId: session.payment_intent as string,
            },
          });

          // Clear cart
          await tx.cartItem.deleteMany({
            where: { userId },
          });

          // Update product stock with validation
          for (const item of cartItemsWithProducts) {
            const product = await tx.product.findUnique({
              where: { id: item.product.id },
              select: { stock: true },
            });

            if (!product) {
              throw new Error(`Product ${item.product.id} not found`);
            }

            if (product.stock < item.quantity) {
              throw new Error(
                `Insufficient stock for ${item.product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
              );
            }

            await tx.product.update({
              where: { id: item.product.id },
              data: { stock: { decrement: item.quantity } },
            });
          }

          return newOrder;
        });

        console.log('Order created from Stripe webhook:', order.orderNumber);
        break;
      }

      case 'payment_intent.succeeded': {
        console.log('Payment intent succeeded:', event.data.object);
        break;
      }

      case 'payment_intent.payment_failed': {
        console.log('Payment intent failed:', event.data.object);
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
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
