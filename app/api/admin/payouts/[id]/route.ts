import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { incrementPaidOnTimeStreak } from '@/lib/trust-badges';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  if (action === 'process') {
    // Mark payout as processing
    const payout = await prisma.payout.update({
      where: { id },
      data: { status: 'PROCESSING', processedAt: new Date() },
    });

    return NextResponse.json({ success: true, payout });
  }

  if (action === 'mark-paid') {
    // Mark payout as paid and update vendor totals
    const payout = await prisma.payout.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Update payout status
      await tx.payout.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Update vendor totals
      await tx.vendor.update({
        where: { id: payout.vendorId },
        data: {
          paidAmount: { increment: payout.amount },
          pendingAmount: { decrement: payout.amount },
          totalEarnings: { increment: payout.amount },
        },
      });
    });

    // Increment paid on time streak and check for badges
    await incrementPaidOnTimeStreak(payout.vendorId);

    // Send WhatsApp notification to vendor about payment
    // TODO: Implement WhatsApp payment alert

    return NextResponse.json({ success: true, action: 'paid' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const payout = await prisma.payout.findUnique({
    where: { id },
    include: {
      vendor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!payout) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  return NextResponse.json({ payout });
}
