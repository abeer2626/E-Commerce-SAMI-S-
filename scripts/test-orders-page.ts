import { prisma } from '../lib/prisma';

async function testOrdersPages() {
  console.log('=== Testing Orders Pages ===\n');

  // 1. Get the test user (Admin User)
  const user = await prisma.user.findFirst({
    where: { email: 'admin@storehub.com' },
  });

  if (!user) {
    console.error('❌ Test user not found!');
    return;
  }

  console.log(`✅ Test User: ${user.name} (${user.email})`);
  console.log(`   User ID: ${user.id}\n`);

  // 2. Get orders for this user
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: { include: { vendor: { include: { user: true } } } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`=== Orders List Page (/orders) ===`);
  console.log(`Total Orders: ${orders.length}\n`);

  if (orders.length === 0) {
    console.log('⚠️  No orders found - would show "No orders yet" message');
  } else {
    for (const order of orders) {
      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date: ${order.createdAt.toLocaleDateString()}`);
      console.log(`   Total: $${order.total.toFixed(2)}`);
      console.log(`   Items (${order.items.length}):`);
      for (const item of order.items) {
        console.log(`      - ${item.quantity}x ${item.product.name} = $${(item.price * item.quantity).toFixed(2)}`);
      }
      console.log('');
    }
  }

  // 3. Test order detail page for the first order
  if (orders.length > 0) {
    const order = orders[0];
    console.log(`=== Order Detail Page (/orders/${order.id}) ===`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Status: ${order.status}`);
    console.log(`Shipping Address:\n   ${order.shippingAddress.replace(/\n/g, '\n   ')}`);
    console.log(`\nOrder Items:`);
    for (const item of order.items) {
      console.log(`   - ${item.product.name}`);
      console.log(`     Sold by: ${item.product.vendor.businessName}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: $${(item.price * item.quantity).toFixed(2)}`);
    }
    console.log(`\nTotal: $${order.total.toFixed(2)}`);
  }

  // 4. Test URLs
  console.log(`\n=== Page URLs ===`);
  console.log(`Orders List: http://localhost:3001/orders`);
  if (orders.length > 0) {
    console.log(`Order Detail: http://localhost:3001/orders/${orders[0].id}`);
  }

  console.log(`\n✅ Orders pages test complete!`);

  await prisma.$disconnect();
}

testOrdersPages().catch(console.error);
