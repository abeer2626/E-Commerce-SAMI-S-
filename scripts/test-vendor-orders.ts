import { prisma } from '../lib/prisma';

async function testVendorOrdersPage() {
  console.log('=== Testing Vendor Orders Page ===\n');

  // 1. Get the vendor that owns the sunglasses products
  const products = await prisma.product.findMany({
    where: { category: 'Accessories' },
    include: { vendor: { include: { user: true } } },
  });

  if (products.length === 0) {
    console.error('❌ No products found!');
    return;
  }

  const vendor = products[0].vendor;
  console.log(`✅ Vendor: ${vendor.businessName}`);
  console.log(`   User: ${vendor.user.name} (${vendor.user.email})`);
  console.log(`   User ID: ${vendor.user.id}`);
  console.log(`   Role: ${vendor.user.role}\n`);

  if (vendor.user.role !== 'VENDOR') {
    console.warn(`⚠️  Warning: User role is ${vendor.user.role}, not VENDOR`);
    console.warn(`   The vendor orders page requires role = VENDOR\n`);
  }

  // 2. Query order items the same way the page does
  console.log(`=== Querying Order Items for Vendor ===`);
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: { vendorId: vendor.id },
    },
    include: {
      order: {
        include: {
          user: true,
        },
      },
      product: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
  });

  console.log(`Total order items found: ${orderItems.length}\n`);

  if (orderItems.length === 0) {
    console.log('⚠️  No order items found for this vendor');
    console.log('   The vendor orders page would show "No orders found"\n');
    return;
  }

  // 3. Group by order (same logic as the page)
  const groupedOrders: any = {};
  for (const item of orderItems) {
    const orderId = item.order.id;
    if (!groupedOrders[orderId]) {
      groupedOrders[orderId] = {
        ...item.order,
        items: [],
      };
    }
    groupedOrders[orderId].items.push(item);
  }

  const orders = Object.values(groupedOrders);
  console.log(`=== Orders for Vendor (${orders.length} order(s)) ===\n`);

  for (const order of orders) {
    console.log(`📦 Order: ${order.orderNumber}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    console.log(`   Customer: ${order.user.name} (${order.user.email})`);
    console.log(`   Shipping Address:\n      ${order.shippingAddress.replace(/\n/g, '\n      ')}`);
    console.log(`\n   Items (${order.items.length}):`);
    let orderTotal = 0;
    for (const item of order.items) {
      const itemTotal = item.price * item.quantity;
      orderTotal += itemTotal;
      console.log(`      - ${item.product.name}`);
      console.log(`        Quantity: ${item.quantity} x $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}`);
    }
    console.log(`\n   Order Total: $${orderTotal.toFixed(2)}`);
    console.log('');
  }

  // 4. Check status filter functionality
  console.log(`=== Status Filter Test ===`);
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  for (const status of statuses) {
    const filteredItems = await prisma.orderItem.findMany({
      where: {
        product: { vendorId: vendor.id },
        order: { status },
      },
      include: {
        order: {
          include: { user: true },
        },
        product: true,
      },
    });

    const filtered: any = {};
    for (const item of filteredItems) {
      const orderId = item.order.id;
      if (!filtered[orderId]) {
        filtered[orderId] = { ...item.order, items: [] };
      }
      filtered[orderId].items.push(item);
    }

    console.log(`?status=${status}: ${Object.keys(filtered).length} order(s)`);
  }

  // 5. Test URLs
  console.log(`\n=== Page URLs ===`);
  console.log(`Vendor Orders: http://localhost:3001/vendor/orders`);
  console.log(`Filter by Status: http://localhost:3001/vendor/orders?status=PENDING`);

  console.log(`\n✅ Vendor orders page test complete!`);

  await prisma.$disconnect();
}

testVendorOrdersPage().catch(console.error);
