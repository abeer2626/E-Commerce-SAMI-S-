import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Get customer user
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@example.com' },
  });

  if (!customer) {
    console.log('Customer not found.');
    return;
  }

  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: customer.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    console.log('Cart is empty.');
    return;
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: customer.id,
      total,
      status: 'PENDING',
      paymentMethod: 'COD',
      shippingAddress: JSON.stringify({
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      }),
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      payment: {
        create: {
          amount: total,
          status: 'pending',
          paymentMethod: 'COD',
        },
      },
    },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({
    where: { userId: customer.id },
  });

  console.log('✅ Order placed successfully!\n');
  console.log('Order Details:');
  console.log('━'.repeat(50));
  console.log(`Order Number: ${order.orderNumber}`);
  console.log(`Status: ${order.status}`);
  console.log(`Payment Method: ${order.paymentMethod}`);
  console.log(`Total: $${order.total.toFixed(2)}`);
  console.log('\nItems:');
  order.items.forEach((item) => {
    console.log(`  - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
  });
  console.log('\nShipping Address:');
  console.log('  123 Main Street');
  console.log('  New York, NY 10001');
  console.log('  USA');
  console.log('\n━'.repeat(50));
  console.log('\n🎉 Order created! View at:');
  console.log(`  Customer: http://localhost:3000/orders/${order.id}`);
  console.log(`  Admin:    http://localhost:3000/admin/orders`);
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
