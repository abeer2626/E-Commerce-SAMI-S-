import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // Verify the product belongs to this vendor
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.vendorId !== vendor.id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { name, description, price, category, stock, image, featured } =
    await request.json();

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      category,
      stock,
      image: image || null,
      featured,
    },
  });

  return NextResponse.json({ product: updatedProduct });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // Verify the product belongs to this vendor
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.vendorId !== vendor.id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
