import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where = status ? { status: status.toUpperCase() } : {};

  const payouts = await prisma.payout.findMany({
    where,
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
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ payouts });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { vendorId, amount, method, accountDetails, notes } = body;

  // Create new payout record
  const payout = await prisma.payout.create({
    data: {
      vendorId,
      amount,
      method,
      accountDetails: accountDetails ? JSON.stringify(accountDetails) : null,
      notes,
    },
  });

  // Update vendor pending amount
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      pendingAmount: { increment: amount },
    },
  });

  return NextResponse.json({ success: true, payout }, { status: 201 });
}
