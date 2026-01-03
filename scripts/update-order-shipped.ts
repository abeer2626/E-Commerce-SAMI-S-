import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the most recent order
  const order = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } },
      user: true,
      payment: true,
    },
  });

  if (!order) {
    console.log('No orders found.');
    return;
  }

  // Update status to SHIPPED
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'SHIPPED' },
    include: {
      items: { include: { product: true } },
      user: true,
      payment: true,
    },
  });

  console.log('✅ Order status updated!\n');
  console.log('Order Details:');
  console.log('━'.repeat(50));
  console.log(`Order Number: ${updatedOrder.orderNumber}`);
  console.log(`Status: ${updatedOrder.status}`);
  console.log(`Customer: ${updatedOrder.user.name} (${updatedOrder.user.email})`);
  console.log(`Total: $${updatedOrder.total.toFixed(2)}`);
  console.log('\nItems:');
  updatedOrder.items.forEach((item) => {
    console.log(`  - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
  });
  console.log('\n━'.repeat(50));
  console.log('\n🚚 Status changed from PROCESSING → SHIPPED');
  console.log(`\nView order at: http://localhost:3000/admin/orders`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
