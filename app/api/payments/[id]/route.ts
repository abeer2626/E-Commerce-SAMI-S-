import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updating payment status
const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).optional(),
  stripePaymentId: z.string().optional(),
});

/**
 * PATCH /api/payments/:id
 * Update payment status (e.g., from Stripe webhook)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updatePaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (validation.data.status) {
      updateData.status = validation.data.status;
    }
    if (validation.data.stripePaymentId) {
      updateData.stripePaymentId = validation.data.stripePaymentId;
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
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

    // Update order status based on payment status
    if (validation.data.status === 'completed') {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { status: 'PROCESSING' },
      });
    } else if (validation.data.status === 'refunded') {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return NextResponse.json({
      message: 'Payment updated successfully',
      payment,
    });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/:id
 * Get a single payment by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            shippingAddress: true,
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
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/:id
 * Delete a payment (admin only - should be protected by auth middleware)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Payment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
