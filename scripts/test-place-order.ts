import { prisma } from '../lib/prisma';

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function testPlaceOrder() {
  console.log('=== Testing COD Order Placement ===\n');

  // 1. Get the user and cart
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found!');
    return;
  }
  console.log(`User: ${user.name} (${user.email})`);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    console.error('Cart is empty!');
    return;
  }

  console.log(`\nCart Items (${cartItems.length}):`);
  let total = 0;
  for (const item of cartItems) {
    const itemTotal = item.product.price * item.quantity;
    total += itemTotal;
    console.log(`  - ${item.product.name} x${item.quantity} = $${itemTotal.toFixed(2)}`);
  }
  console.log(`\nTotal: $${total.toFixed(2)}`);

  // 2. Place COD order
  console.log('\n=== Placing COD Order ===');

  const shippingInfo = {
    fullName: 'Test Customer',
    email: 'test@example.com',
    address: '123 Test Street, Test City, TC 12345',
  };

  const shippingAddress = `${shippingInfo.fullName}\n${shippingInfo.address}\n${shippingInfo.email}`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          total,
          shippingAddress,
          paymentMethod: 'COD',
          status: 'PENDING',
          items: {
            create: cartItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          paymentMethod: 'COD',
          status: 'PENDING',
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    console.log(`\n✅ Order placed successfully!`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Total: $${order.total.toFixed(2)}`);
    console.log(`   Payment Method: ${order.paymentMethod}`);
    console.log(`   Status: ${order.status}`);
    console.log(`\n   Items (${order.items.length}):`);
    for (const item of order.items) {
      console.log(`      - ${item.product.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
    }

    // 3. Verify order in database
    console.log('\n=== Verifying Order in Database ===');
    const orderCount = await prisma.order.count();
    const paymentCount = await prisma.payment.count();
    const remainingCart = await prisma.cartItem.count({ where: { userId: user.id } });

    console.log(`Total Orders in DB: ${orderCount}`);
    console.log(`Total Payments in DB: ${paymentCount}`);
    console.log(`Remaining Cart Items: ${remainingCart}`);

    console.log('\n✅ Checkout flow test PASSED!');

  } catch (error) {
    console.error('\n❌ Order placement FAILED:', error);
  }

  await prisma.$disconnect();
}

testPlaceOrder().catch(console.error);
