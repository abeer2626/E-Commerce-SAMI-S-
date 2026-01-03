import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VendorAnalytics from '@/components/VendorAnalytics';

export default async function VendorAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'VENDOR') {
    redirect('/');
  }

  const params = await searchParams;
  const period = params.period || '30'; // default to 30 days

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    include: { products: true },
  });

  if (!vendor) {
    redirect('/vendor/signup');
  }

  const daysAgo = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Get all order items within the period
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: { vendorId: vendor.id },
      order: { createdAt: { gte: startDate } },
    },
    include: {
      order: true,
      product: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
  });

  // Calculate daily revenue
  const dailyRevenue: Record<string, number> = {};
  const dailyOrders: Record<string, number> = {};

  for (let i = daysAgo - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyRevenue[dateStr] = 0;
    dailyOrders[dateStr] = 0;
  }

  orderItems.forEach((item) => {
    const dateStr = item.order.createdAt.toISOString().split('T')[0];
    if (dailyRevenue[dateStr] !== undefined) {
      dailyRevenue[dateStr] += item.price * item.quantity;
      dailyOrders[dateStr] += 1;
    }
  });

  // Product sales
  const productSales: Record<string, { name: string; revenue: number; quantity: number; productId: string }> = {};
  orderItems.forEach((item) => {
    if (!productSales[item.product.id]) {
      productSales[item.product.id] = {
        name: item.product.name,
        revenue: 0,
        quantity: 0,
        productId: item.product.id,
      };
    }
    productSales[item.product.id].revenue += item.price * item.quantity;
    productSales[item.product.id].quantity += item.quantity;
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Order status breakdown
  const statusCounts = orderItems.reduce((acc: any, item) => {
    const status = item.order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate totals
  const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;
  const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Previous period comparison
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - daysAgo);

  const prevOrderItems = await prisma.orderItem.findMany({
    where: {
      product: { vendorId: vendor.id },
      order: {
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    },
  });

  const prevRevenue = prevOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <VendorAnalytics
        dailyRevenue={dailyRevenue}
        dailyOrders={dailyOrders}
        topProducts={topProducts}
        statusCounts={statusCounts}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalItemsSold={totalItemsSold}
        avgOrderValue={avgOrderValue}
        revenueChange={revenueChange}
        period={period}
      />
    </div>
  );
}
