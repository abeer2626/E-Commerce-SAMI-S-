import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { name, description, price, category, stock, image, featured } =
    await request.json();

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      category,
      stock,
      image,
      featured,
      vendorId: vendor.id,
    },
  });

  return NextResponse.json({ product });
}
