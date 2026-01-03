import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for creating a category
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

/**
 * GET /api/categories
 * Get all unique categories from products with product counts
 */
export async function GET() {
  try {
    // Get unique categories with product counts
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        name: cat.category,
        productCount: cat._count.category,
      }))
    );
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Note: Categories are stored as strings in Product model
 * This endpoint validates that a category name would be valid
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;

    // Check if category already exists
    const existingCategory = await prisma.product.findFirst({
      where: { category: name },
      select: { category: true },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    // Return the validated category (it will be created when a product uses it)
    return NextResponse.json(
      {
        message: 'Category validated successfully',
        category: {
          name,
          description,
          note: 'Category will be created when a product is assigned to it',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
