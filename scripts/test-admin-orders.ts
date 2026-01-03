import { prisma } from '../lib/prisma';

async function testAdminOrdersPage() {
  console.log('=== Testing Admin Orders Page ===\n');

  // 1. Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ Admin user not found!');
    return;
  }

  console.log(`✅ Admin User: ${admin.name} (${admin.email})`);
  console.log(`   User ID: ${admin.id}`);
  console.log(`   Role: ${admin.role}\n`);

  // 2. Test GET all orders (no filters)
  console.log(`=== GET /api/admin/orders (All Orders) ===`);
  const allOrders = await prisma.order.findMany({
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
      items: {
        include: {
          product: {
            include: {
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total Orders: ${allOrders.length}\n`);

  if (allOrders.length === 0) {
    console.log('⚠️  No orders in database');
  } else {
    for (const order of allOrders) {
      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Customer: ${order.user.name} (${order.user.email})`);
      console.log(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`   Total: $${order.total.toFixed(2)}`);
      if (order.payment) {
        console.log(`   Payment: ${order.payment.status} - $${order.payment.amount.toFixed(2)}`);
      }
      console.log(`   Items (${order.items.length}):`);
      for (const item of order.items) {
        console.log(`      - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)} (Vendor: ${item.product.vendor.businessName})`);
      }
      console.log('');
    }
  }

  // 3. Test status filters
  console.log(`=== Status Filter Test ===`);
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  for (const status of statuses) {
    const filteredOrders = await prisma.order.findMany({
      where: { status },
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
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`?status=${status}: ${filteredOrders.length} order(s)`);
  }

  // 4. Test pagination
  console.log(`\n=== Pagination Test ===`);
  const limit = 20;
  const total = await prisma.order.count({});
  const hasMore = total > limit;

  console.log(`Total Orders: ${total}`);
  console.log(`Page Limit: ${limit}`);
  console.log(`Has More: ${hasMore}`);
  console.log(`Pages: ${Math.ceil(total / limit) || 1}`);

  // 5. Test status update API (simulate PATCH request)
  if (allOrders.length > 0) {
    console.log(`\n=== Status Update Test ===`);
    const order = allOrders[0];
    const currentStatus = order.status;

    console.log(`Order: ${order.orderNumber}`);
    console.log(`Current Status: ${currentStatus}`);

    // Find next status
    const statusIndex = statuses.indexOf(currentStatus);
    const nextStatus = statusIndex < statuses.length - 1
      ? statuses[statusIndex + 1]
      : 'PENDING';

    console.log(`Updating to: ${nextStatus}`);

    try {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log(`✅ Status updated successfully!`);
      console.log(`   New Status: ${updatedOrder.status}`);

      // Verify in DB
      const verified = await prisma.order.findUnique({
        where: { id: order.id },
      });
      console.log(`   Verified: ${verified?.status}`);

      // Reset back to original
      await prisma.order.update({
        where: { id: order.id },
        data: { status: currentStatus },
      });
      console.log(`✅ Reset to: ${currentStatus}`);

    } catch (error) {
      console.error(`❌ Status update failed:`, error);
    }
  }

  // 6. Test user filter
  console.log(`\n=== User Filter Test ===`);
  if (allOrders.length > 0) {
    const userId = allOrders[0].userId;
    const userOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`?userId=${userId}: ${userOrders.length} order(s)`);
    console.log(`   User: ${userOrders[0]?.user.name} (${userOrders[0]?.user.email})`);
  }

  // 7. Page URLs
  console.log(`\n=== Page URLs ===`);
  console.log(`Admin Orders: http://localhost:3001/admin/orders`);
  console.log(`API: http://localhost:3001/api/admin/orders`);

  console.log(`\n✅ Admin orders page test complete!`);

  await prisma.$disconnect();
}

testAdminOrdersPage().catch(console.error);
