import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const renameCategorySchema = z.object({
  oldName: z.string().min(1, 'Old category name is required'),
  newName: z.string().min(2, 'New category name must be at least 2 characters'),
});

const mergeCategoriesSchema = z.object({
  sourceCategory: z.string().min(1, 'Source category is required'),
  targetCategory: z.string().min(1, 'Target category is required'),
});

/**
 * GET /api/admin/categories
 * Get all categories with detailed statistics
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'name'; // name, count, avgPrice, revenue
    const order = searchParams.get('order') || 'asc'; // asc, desc

    // Get all unique categories with statistics
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      _avg: {
        price: true,
      },
      _sum: {
        price: true,
      },
      orderBy:
        sortBy === 'name'
          ? { category: order as 'asc' | 'desc' }
          : sortBy === 'count'
          ? { _count: { category: order as 'asc' | 'desc' } }
          : sortBy === 'avgPrice'
          ? { _avg: { price: order as 'asc' | 'desc' } }
          : { _sum: { price: order as 'asc' | 'desc' } },
    });

    // Get stock information for each category
    const categoryStock = await prisma.product.groupBy({
      by: ['category'],
      _sum: {
        stock: true,
      },
    });

    const stockMap = new Map(
      categoryStock.map((item) => [item.category, item._sum.stock || 0])
    );

    // Get low stock counts (products with stock < 5) per category
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      select: {
        category: true,
        id: true,
      },
    });

    const lowStockMap = new Map<string, number>();
    lowStockProducts.forEach((product) => {
      const current = lowStockMap.get(product.category) || 0;
      lowStockMap.set(product.category, current + 1);
    });

    // Get featured product counts per category
    const featuredProducts = await prisma.product.groupBy({
      by: ['category'],
      where: {
        featured: true,
      },
      _count: {
        category: true,
      },
    });

    const featuredMap = new Map(
      featuredProducts.map((item) => [item.category, item._count.category])
    );

    // Enrich categories with additional stats
    const enrichedCategories = categories.map((cat) => ({
      name: cat.category,
      productCount: cat._count.category,
      averagePrice: cat._avg.price || 0,
      totalValue: cat._sum.price || 0,
      totalStock: stockMap.get(cat.category) || 0,
      lowStockCount: lowStockMap.get(cat.category) || 0,
      featuredCount: featuredMap.get(cat.category) || 0,
    }));

    return NextResponse.json({
      categories: enrichedCategories,
      total: enrichedCategories.length,
    });
  } catch (error) {
    console.error('Admin categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories
 * Rename or merge categories
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === 'rename') {
      // Validate rename request
      const validation = renameCategorySchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { oldName, newName } = validation.data;

      // Check if old category exists
      const existingProducts = await prisma.product.findMany({
        where: { category: oldName },
        select: { id: true },
      });

      if (existingProducts.length === 0) {
        return NextResponse.json(
          { error: `Category "${oldName}" not found` },
          { status: 404 }
        );
      }

      // Check if new category name already exists
      const conflictingProducts = await prisma.product.findFirst({
        where: { category: newName },
      });

      if (conflictingProducts) {
        return NextResponse.json(
          { error: `Category "${newName}" already exists` },
          { status: 409 }
        );
      }

      // Update all products with the old category name
      const result = await prisma.product.updateMany({
        where: { category: oldName },
        data: { category: newName },
      });

      return NextResponse.json({
        message: 'Category renamed successfully',
        oldName,
        newName,
        affectedProducts: result.count,
      });
    }

    if (action === 'merge') {
      // Validate merge request
      const validation = mergeCategoriesSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { sourceCategory, targetCategory } = validation.data;

      // Check if source category exists
      const sourceProducts = await prisma.product.findMany({
        where: { category: sourceCategory },
        select: { id: true },
      });

      if (sourceProducts.length === 0) {
        return NextResponse.json(
          { error: `Source category "${sourceCategory}" not found` },
          { status: 404 }
        );
      }

      // Cannot merge into itself
      if (sourceCategory === targetCategory) {
        return NextResponse.json(
          { error: 'Cannot merge category into itself' },
          { status: 400 }
        );
      }

      // Update all products from source to target category
      const result = await prisma.product.updateMany({
        where: { category: sourceCategory },
        data: { category: targetCategory },
      });

      return NextResponse.json({
        message: 'Categories merged successfully',
        sourceCategory,
        targetCategory,
        mergedProducts: result.count,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "rename" or "merge"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin categories update error:', error);
    return NextResponse.json(
      { error: 'Failed to update categories' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories
 * Delete a category (only if no products are assigned)
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryName = searchParams.get('name');

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { category: categoryName },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${productCount} product(s). Reassign or delete products first.`,
          productCount,
        },
        { status: 400 }
      );
    }

    // Since categories are just strings on products, and we confirmed no products use this category,
    // the category is effectively deleted already
    return NextResponse.json({
      message: 'Category deleted successfully',
      category: categoryName,
    });
  } catch (error) {
    console.error('Admin category delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
