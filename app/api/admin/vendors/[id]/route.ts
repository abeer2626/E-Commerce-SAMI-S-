import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

  if (action === 'reject') {
    // Delete vendor and related data
    await prisma.vendor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, action: 'rejected' });
  }

  // Approve vendor
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { isApproved: true },
    include: { user: true },
  });

  return NextResponse.json({ success: true, action: 'approved', vendor });
}
