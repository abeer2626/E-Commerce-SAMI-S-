import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    // Build date filter for period-based stats
    let dateFilter: any = {};
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { gte: today };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Fetch all stats in parallel
    const [
      userCount,
      vendorCount,
      productCount,
      orderCount,
      totalRevenue,
      pendingVendors,
      recentOrders,
      lowStockProducts,
      categoryStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { role: 'USER' },
      }),

      // Total vendors
      prisma.vendor.count(),

      // Total products
      prisma.product.count(),

      // Total orders
      prisma.order.count({
        where: dateFilter ? { createdAt: dateFilter } : undefined,
      }),

      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: { amount: true },
      }),

      // Pending vendors
      prisma.vendor.findMany({
        where: { isApproved: false },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Recent orders
      prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Low stock products (less than 5)
      prisma.product.findMany({
        where: {
          stock: {
            lt: 5,
          },
        },
        orderBy: {
          stock: 'asc',
        },
        take: 10,
      }),

      // Category distribution
      prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        _avg: {
          price: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Calculate order status distribution
    const orderStatusStats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      ...(dateFilter ? { where: { createdAt: dateFilter } } : {}),
    });

    return NextResponse.json({
      stats: {
        userCount,
        vendorCount,
        productCount,
        orderCount,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      pendingVendors,
      recentOrders,
      lowStockProducts,
      categoryStats: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
        avgPrice: stat._avg.price || 0,
      })),
      orderStatusStats: orderStatusStats.map((stat) => ({
        status: stat.status,
        count: stat._count.status,
      })),
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
