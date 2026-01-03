import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const now = new Date();

    const where: any = {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (position) {
      where.position = position;
    }

    const featuredSlots = await prisma.featuredSlot.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            category: true,
            stock: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      orderBy: [
        { position: 'asc' },
        { slotNumber: 'asc' },
      ],
    });

    // Transform the data to include vendor inside product
    const slots = featuredSlots.map((slot) => ({
      id: slot.id,
      position: slot.position,
      slotNumber: slot.slotNumber,
      price: slot.price,
      status: slot.status,
      startDate: slot.startDate,
      endDate: slot.endDate,
      product: {
        ...slot.product,
        vendor: {
          id: slot.vendor.id,
          businessName: slot.vendor.businessName,
        },
      },
    }));

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Featured fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
