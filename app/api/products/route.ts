import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for creating a product
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  image: z.string().url('Must be a valid URL').optional().nullable(),
  featured: z.boolean().optional(),
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

/**
 * GET /api/products
 * Fetch all products with optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const vendorId = searchParams.get('vendorId');
    const inStock = searchParams.get('inStock');

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Fetch products with vendor info
    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            trustScore: true,
            badges: true,
            paidOnTimeStreak: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove password from vendor user
    const sanitizedProducts = products.map((product) => ({
      ...product,
      vendor: {
        ...product.vendor,
        user: {
          ...product.vendor.user,
          // No password exposed
        },
      },
    }));

    return NextResponse.json(sanitizedProducts);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: data.vendorId },
      select: { id: true, isApproved: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (!vendor.isApproved) {
      return NextResponse.json(
        { error: 'Vendor account is not approved yet' },
        { status: 403 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        image: data.image,
        featured: data.featured || false,
        vendorId: data.vendorId,
      },
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
    });

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
