import { prisma } from '../lib/prisma';

async function testVendorStatusUpdate() {
  console.log('=== Testing Vendor Order Status Update ===\n');

  // 1. Get the vendor user
  const vendor = await prisma.vendor.findFirst({
    where: { businessName: 'Tech Essentials' },
    include: { user: true },
  });

  if (!vendor) {
    console.error('❌ Vendor not found!');
    return;
  }

  console.log(`✅ Vendor: ${vendor.businessName}`);
  console.log(`   User: ${vendor.user.name} (${vendor.user.email})`);
  console.log(`   Role: ${vendor.user.role}\n`);

  // 2. Get orders for this vendor
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: { vendorId: vendor.id },
    },
    include: {
      order: true,
      product: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
  });

  if (orderItems.length === 0) {
    console.log('⚠️  No orders found for this vendor');
    return;
  }

  const orderId = orderItems[0].orderId;
  const currentStatus = orderItems[0].order.status;

  console.log(`=== Current Order Status ===`);
  console.log(`Order ID: ${orderId}`);
  console.log(`Order Number: ${orderItems[0].order.orderNumber}`);
  console.log(`Current Status: ${currentStatus}\n`);

  // 3. Test status update
  console.log(`=== Testing Status Update ===`);
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Find next status to update to
  const currentIndex = validStatuses.indexOf(currentStatus);
  const nextStatus = currentIndex < validStatuses.length - 1
    ? validStatuses[currentIndex + 1]
    : 'PENDING';

  console.log(`Updating status from ${currentStatus} to ${nextStatus}...`);

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    console.log(`\n✅ Status updated successfully!`);
    console.log(`   Order: ${updatedOrder.orderNumber}`);
    console.log(`   New Status: ${updatedOrder.status}`);

    // Verify the update
    console.log(`\n=== Verification ===`);
    const verifiedOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    console.log(`Verified Status in DB: ${verifiedOrder?.status}`);

    // Show order details
    console.log(`\n=== Updated Order Details ===`);
    console.log(`Order Number: ${updatedOrder.orderNumber}`);
    console.log(`Status: ${updatedOrder.status}`);
    console.log(`Customer: ${updatedOrder.user.name} (${updatedOrder.user.email})`);
    console.log(`Items:`);
    for (const item of updatedOrder.items) {
      console.log(`  - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
    }
    console.log(`Total: $${updatedOrder.total.toFixed(2)}`);

    // Reset back to PENDING for future tests
    console.log(`\n=== Resetting to PENDING for future tests ===`);
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING' },
    });
    console.log(`✅ Reset complete`);

  } catch (error) {
    console.error(`\n❌ Status update failed:`, error);
  }

  console.log(`\n✅ Vendor status update test complete!`);

  await prisma.$disconnect();
}

testVendorStatusUpdate().catch(console.error);
