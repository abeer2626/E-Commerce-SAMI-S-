import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const featuredSlotSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  position: z.enum(['HOMEPAGE_HERO', 'HOMEPAGE_GRID', 'CATEGORY_TOP', 'CATEGORY_SIDEBAR']),
  slotNumber: z.number().int().min(1).max(10),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
  duration: z.number().int().min(1), // Duration in weeks
});

// Pricing per position (PKR per week)
const POSITION_PRICES: Record<string, number> = {
  HOMEPAGE_HERO: 5000,
  HOMEPAGE_GRID: 3000,
  CATEGORY_TOP: 2000,
  CATEGORY_SIDEBAR: 2000,
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = featuredSlotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, position, slotNumber, startDate, duration } = validation.data;

    // Verify product exists and belongs to vendor (if vendor is booking)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or the vendor of this product
    const isAdmin = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR' && product.vendor.userId === session.user.id;

    if (!isAdmin && !isVendor) {
      return NextResponse.json(
        { error: 'You can only feature your own products' },
        { status: 403 }
      );
    }

    // Calculate end date and price
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration * 7);

    const pricePerWeek = POSITION_PRICES[position];
    const totalPrice = pricePerWeek * duration;

    // Check if slot is available
    const existingSlot = await prisma.featuredSlot.findFirst({
      where: {
        position,
        slotNumber,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: 'This slot is already booked for the selected dates' },
        { status: 409 }
      );
    }

    // Create featured slot
    const featuredSlot = await prisma.featuredSlot.create({
      data: {
        productId,
        vendorId: product.vendorId,
        position,
        slotNumber,
        startDate: start,
        endDate: end,
        price: totalPrice,
        status: 'ACTIVE',
        isPaid: isAdmin, // Auto-mark as paid if admin creates it
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      featuredSlot: {
        ...featuredSlot,
        pricePerWeek,
        totalWeeks: duration,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Featured slot creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create featured slot' },
      { status: 500 }
    );
  }
}
