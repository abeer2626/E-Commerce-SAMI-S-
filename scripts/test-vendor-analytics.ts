import { prisma } from '../lib/prisma';

async function testVendorAnalytics() {
  console.log('=== Testing Vendor Analytics Page ===\n');

  // 1. Get vendor
  console.log('=== 1. Finding Vendor ===');
  const vendor = await prisma.vendor.findFirst({
    where: { isApproved: true },
    include: { user: true, products: true },
  });

  if (!vendor) {
    console.error('❌ No approved vendor found!');
    return;
  }

  console.log(`✅ Vendor: ${vendor.businessName}`);
  console.log(`   User: ${vendor.user.name} (${vendor.user.email})`);
  console.log(`   Total Products: ${vendor.products.length}\n`);

  // 2. Test different time periods
  const periods = ['7', '30', '90'];
  const results: Record<string, any> = {};

  for (const period of periods) {
    console.log(`=== 2. Testing ${period} Days Period ===`);

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get order items within the period
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

    console.log(`   Order Items: ${orderItems.length}`);

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

    // Store results
    results[period] = {
      orderItems: orderItems.length,
      dailyRevenue,
      dailyOrders,
      topProducts,
      statusCounts,
      totalRevenue,
      totalOrders,
      totalItemsSold,
      avgOrderValue,
      revenueChange,
      prevRevenue,
    };

    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Items Sold: ${totalItemsSold}`);
    console.log(`   Avg Order Value: $${avgOrderValue.toFixed(2)}`);
    console.log(`   Revenue Change: ${revenueChange.toFixed(1)}% (prev: $${prevRevenue.toFixed(2)})`);
    console.log('');
  }

  // 3. Detailed 30-day analysis
  console.log('=== 3. Detailed Analysis (30 Days) ===');
  const data = results['30'];

  console.log(`Daily Revenue Data (${Object.keys(data.dailyRevenue).length} days):`);
  const revenueEntries = Object.entries(data.dailyRevenue).filter(([_, v]) => (v as number) > 0);
  if (revenueEntries.length > 0) {
    console.log('  Days with revenue:');
    for (const [date, revenue] of revenueEntries) {
      const orders = data.dailyOrders[date];
      console.log(`    ${date}: $${(revenue as number).toFixed(2)} (${orders} orders)`);
    }
  } else {
    console.log('  No revenue in this period');
  }

  // 4. Top Products
  console.log('\n=== 4. Top Products (30 Days) ===');
  if (data.topProducts.length === 0) {
    console.log('⚠️  No sales data yet');
  } else {
    for (let i = 0; i < data.topProducts.length; i++) {
      const product = data.topProducts[i];
      console.log(`  ${i + 1}. ${product.name}`);
      console.log(`     Revenue: $${product.revenue.toFixed(2)}`);
      console.log(`     Quantity: ${product.quantity} sold`);
    }
  }

  // 5. Order Status Breakdown
  console.log('\n=== 5. Order Status Breakdown (30 Days) ===');
  const totalStatusCount = Object.values(data.statusCounts).reduce((sum: number, count) => sum + (count as number), 0);
  if (totalStatusCount === 0) {
    console.log('⚠️  No orders yet');
  } else {
    for (const [status, count] of Object.entries(data.statusCounts).sort(([, a], [, b]) => (b as number) - (a as number))) {
      const percentage = ((count as number) / totalStatusCount) * 100;
      console.log(`  ${status}: ${count} (${percentage.toFixed(1)}%)`);
    }
  }

  // 6. Period comparison
  console.log('\n=== 6. Period Comparison ===');
  console.log('Period   | Revenue | Orders | Items | Avg Order');
  console.log('---------|---------|--------|-------|----------');
  for (const period of periods) {
    const r = results[period];
    console.log(
      `${period} days | $${r.totalRevenue.toFixed(2).padEnd(7)} | ${r.totalOrders.toString().padEnd(6)} | ${r.totalItemsSold.toString().padEnd(5)} | $${r.avgOrderValue.toFixed(2)}`
    );
  }

  // 7. Key metrics summary
  console.log('\n=== 7. Key Metrics Summary (30 Days) ===');
  console.log(`Total Revenue: $${data.totalRevenue.toFixed(2)}`);
  console.log(`Total Orders: ${data.totalOrders}`);
  console.log(`Items Sold: ${data.totalItemsSold}`);
  console.log(`Average Order Value: $${data.avgOrderValue.toFixed(2)}`);
  console.log(`Revenue vs Previous Period: ${data.revenueChange >= 0 ? '+' : ''}${data.revenueChange.toFixed(1)}%`);
  console.log(`Top Selling Product: ${data.topProducts.length > 0 ? data.topProducts[0].name : 'N/A'}`);

  // 8. Page URLs
  console.log('\n=== 8. Page URLs ===');
  console.log(`Vendor Analytics: http://localhost:3001/vendor/analytics`);
  console.log(`7 Days: http://localhost:3001/vendor/analytics?period=7`);
  console.log(`30 Days: http://localhost:3001/vendor/analytics?period=30`);
  console.log(`90 Days: http://localhost:3001/vendor/analytics?period=90`);

  console.log('\n✅ Vendor Analytics test complete!');

  await prisma.$disconnect();
}

testVendorAnalytics().catch(console.error);
