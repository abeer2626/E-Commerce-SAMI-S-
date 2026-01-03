import { prisma } from '../lib/prisma';

async function testAdminDashboard() {
  console.log('=== Testing Admin Dashboard ===\n');

  // 1. Get admin user
  console.log('=== 1. Finding Admin User ===');
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ Admin user not found!');
    return;
  }

  console.log(`✅ Admin: ${admin.name} (${admin.email})`);
  console.log(`   Role: ${admin.role}\n`);

  // 2. Fetch all dashboard stats
  console.log('=== 2. Fetching Dashboard Stats ===');

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
    prisma.order.count(),

    // Total revenue from completed payments
    prisma.payment.aggregate({
      where: { status: 'completed' },
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

    // Low stock products
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

  // Order status distribution
  const orderStatusStats = await prisma.order.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  console.log('✅ Stats fetched successfully\n');

  // 3. Display Stats
  console.log('=== 3. Key Metrics ===');
  console.log(`Total Users: ${userCount}`);
  console.log(`Total Vendors: ${vendorCount}`);
  console.log(`Total Products: ${productCount}`);
  console.log(`Total Orders: ${orderCount}`);
  console.log(`Total Revenue: $${(totalRevenue._sum.amount || 0).toFixed(2)}\n`);

  // 4. Low Stock Alert
  console.log('=== 4. Low Stock Alert ===');
  if (lowStockProducts.length === 0) {
    console.log('✅ No products low on stock');
  } else {
    console.log(`⚠️  ${lowStockProducts.length} product(s) low on stock:`);
    for (const product of lowStockProducts) {
      console.log(`   - ${product.name}: ${product.stock} left ($${product.price.toFixed(2)})`);
    }
  }
  console.log('');

  // 5. Recent Orders
  console.log('=== 5. Recent Orders ===');
  if (recentOrders.length === 0) {
    console.log('⚠️  No orders yet');
  } else {
    for (const order of recentOrders) {
      console.log(`📦 ${order.orderNumber}`);
      console.log(`   Customer: ${order.user.name} (${order.user.email})`);
      console.log(`   Total: $${order.total.toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      if (order.payment) {
        console.log(`   Payment: ${order.payment.status} - $${order.payment.amount.toFixed(2)}`);
      }
      console.log('');
    }
  }

  // 6. Pending Vendors
  console.log('=== 6. Pending Vendor Approvals ===');
  if (pendingVendors.length === 0) {
    console.log('✅ No pending vendor approvals');
  } else {
    console.log(`⚠️  ${pendingVendors.length} vendor(s) waiting approval:`);
    for (const vendor of pendingVendors) {
      console.log(`   - ${vendor.businessName}`);
      console.log(`     ${vendor.user.name} (${vendor.user.email})`);
      console.log(`     Applied: ${new Date(vendor.createdAt).toLocaleDateString()}`);
    }
  }
  console.log('');

  // 7. Category Distribution
  console.log('=== 7. Category Distribution ===');
  if (categoryStats.length === 0) {
    console.log('⚠️  No categories found');
  } else {
    console.log('Category      | Products | Avg Price');
    console.log('--------------|----------|----------');
    for (const stat of categoryStats) {
      console.log(`${stat.category.padEnd(13)} | ${String(stat._count.category).padEnd(8)} | $${(stat._avg.price || 0).toFixed(2)}`);
    }
  }
  console.log('');

  // 8. Order Status Overview
  console.log('=== 8. Order Status Overview ===');
  if (orderStatusStats.length === 0) {
    console.log('⚠️  No orders yet');
  } else {
    console.log('Status      | Count');
    console.log('------------|------');
    for (const stat of orderStatusStats) {
      console.log(`${stat.status.padEnd(11)} | ${stat._count.status}`);
    }
  }
  console.log('');

  // 9. Additional Analytics
  console.log('=== 9. Additional Analytics ===');
  const avgOrderValue = orderCount > 0 ? (totalRevenue._sum.amount || 0) / orderCount : 0;
  console.log(`Average Order Value: $${avgOrderValue.toFixed(2)}`);
  console.log(`Revenue per Vendor: ${vendorCount > 0 ? `$${((totalRevenue._sum.amount || 0) / vendorCount).toFixed(2)}` : 'N/A'}`);
  console.log(`Products per Vendor: ${vendorCount > 0 ? (productCount / vendorCount).toFixed(1) : 'N/A'}`);
  console.log(`Orders per User: ${userCount > 0 ? (orderCount / userCount).toFixed(2) : 'N/A'}`);

  // 10. User breakdown
  console.log('\n=== 10. User Breakdown ===');
  const [adminCount, vendorUsers, regularUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'VENDOR' } }),
    prisma.user.count({ where: { role: 'USER' } }),
  ]);
  console.log(`Admins: ${adminCount}`);
  console.log(`Vendors: ${vendorUsers}`);
  console.log(`Regular Users: ${regularUsers}`);
  console.log(`Total Users: ${adminCount + vendorUsers + regularUsers}`);

  // 11. Page URLs
  console.log('\n=== 11. Page URLs ===');
  console.log('Admin Dashboard: http://localhost:3001/admin/dashboard');
  console.log('Admin Orders: http://localhost:3001/admin/orders');
  console.log('Admin Products: http://localhost:3001/admin/products');
  console.log('Admin Vendors: http://localhost:3001/admin/vendors');
  console.log('Admin Users: http://localhost:3001/admin/users');
  console.log('API Stats: http://localhost:3001/api/admin/stats');

  console.log('\n✅ Admin Dashboard test complete!');

  await prisma.$disconnect();
}

testAdminDashboard().catch(console.error);
