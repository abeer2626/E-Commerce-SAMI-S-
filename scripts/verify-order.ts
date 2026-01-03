import { prisma } from '../lib/prisma';

async function verify() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== Orders ===');
  for (const order of orders) {
    console.log(`Order: ${order.orderNumber} | Total: $${order.total} | Status: ${order.status} | Payment: ${order.paymentMethod}`);
    console.log(`Customer: ${order.user.name} (${order.user.email})`);
    for (const item of order.items) {
      console.log(`  - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
    }
  }

  const products = await prisma.product.findMany({ where: { category: 'Accessories' } });
  console.log('\n=== Products (Stock) ===');
  for (const p of products) {
    console.log(`${p.name} | Stock: ${p.stock} | Price: $${p.price}`);
  }

  const cart = await prisma.cartItem.count();
  console.log('\n=== Cart ===');
  console.log(`Remaining items: ${cart}`);

  const payments = await prisma.payment.findMany({ include: { order: true } });
  console.log('\n=== Payments ===');
  for (const payment of payments) {
    console.log(`Amount: $${payment.amount} | Method: ${payment.paymentMethod} | Status: ${payment.status} | Order: ${payment.order.orderNumber}`);
  }

  await prisma.$disconnect();
}

verify().catch(console.error);
