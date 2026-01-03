import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/stats
 * Get platform statistics for trust signals
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get today's orders count
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get approved/active vendors count
    const activeVendors = await prisma.vendor.count({
      where: { isApproved: true },
    });

    // Get total products count
    const totalProducts = await prisma.product.count();

    // Get total orders count (all time)
    const totalOrders = await prisma.order.count();

    // Get total revenue (all time)
    const orders = await prisma.order.findMany({
      select: { total: true },
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });

    return NextResponse.json({
      todayOrders,
      activeVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      codAvailable: true, // Pakistan market - COD is always available
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
