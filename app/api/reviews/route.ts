import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, rating, comment } = await request.json();

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (existingReview) {
    return NextResponse.json(
      { error: 'You have already reviewed this product' },
      { status: 400 }
    );
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      productId,
      rating,
      comment: comment || null,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json({ review });
}
