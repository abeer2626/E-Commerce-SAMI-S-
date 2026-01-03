import { prisma } from '../lib/prisma';

async function testCheckoutFlow() {
  console.log('=== Testing Checkout Flow ===\n');

  // 1. Check existing data
  console.log('1. Checking existing data...');
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const cartCount = await prisma.cartItem.count();
  const orderCount = await prisma.order.count();

  console.log(`   Users: ${userCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Cart Items: ${cartCount}`);
  console.log(`   Orders: ${orderCount}\n`);

  // 2. Get or create a test user
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('2. Creating test user...');
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'CUSTOMER',
      },
    });
    console.log(`   Created user: ${user.name} (${user.email})\n`);
  } else {
    console.log(`2. Using existing user: ${user.name} (${user.email})\n`);
  }

  // 3. Get or create a vendor
  let vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    console.log('3. Creating test vendor...');
    vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName: 'Test Vendor',
        isApproved: true,
      },
    });
    console.log(`   Created vendor: ${vendor.businessName}\n`);
  } else {
    console.log(`3. Using existing vendor: ${vendor.businessName}\n`);
  }

  // 4. Get or create sunglasses products
  console.log('4. Checking sunglasses products...');
  let products = await prisma.product.findMany({
    where: { category: 'Accessories' },
  });

  if (products.length === 0) {
    console.log('   Creating sunglasses products...');
    const productData = [
      {
        id: 'sun-001',
        name: 'Premium Aviator Sunglasses',
        price: 129.99,
        category: 'Accessories',
        image: '/001. Optical.jpg',
        description: 'Classic aviator style with polarized lenses',
        stock: 15,
        featured: true,
        vendorId: vendor.id,
      },
      {
        id: 'sun-002',
        name: 'Classic Wayfarer Sunglasses',
        price: 89.99,
        category: 'Accessories',
        image: '/002.Optical  (1).jpg',
        description: 'Timeless wayfarer design',
        stock: 20,
        featured: true,
        vendorId: vendor.id,
      },
    ];

    for (const data of productData) {
      await prisma.product.create({ data });
      console.log(`   Created: ${data.name} - $${data.price}`);
    }
    products = await prisma.product.findMany({
      where: { category: 'Accessories' },
    });
    console.log('');
  } else {
    console.log(`   Found ${products.length} existing products\n`);
  }

  // 5. Add items to cart
  console.log('5. Adding items to cart...');
  await prisma.cartItem.deleteMany({
    where: { userId: user.id },
  });

  for (const product of products.slice(0, 2)) {
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1,
      },
    });
    console.log(`   Added to cart: ${product.name}`);
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  console.log(`   Cart total: $${cartTotal.toFixed(2)}\n`);

  // 6. Get available payment methods
  console.log('6. Checking payment methods...');
  const paymentMethodsUrl = `http://localhost:3001/api/checkout/payment-methods?orderTotal=${cartTotal}&categories=Accessories`;
  console.log(`   URL: ${paymentMethodsUrl}\n`);

  // 7. Summary for checkout
  console.log('=== Ready for Checkout Test ===');
  console.log(`User ID: ${user.id}`);
  console.log(`Cart Items: ${cartItems.length}`);
  console.log(`Total: $${cartTotal.toFixed(2)}`);
  console.log('\nTo test checkout:');
  console.log('1. Sign in with test@example.com');
  console.log('2. Go to http://localhost:3001/checkout');
  console.log('3. Fill in shipping info');
  console.log('4. Select COD payment method');
  console.log('5. Click "Place Order"\n');

  await prisma.$disconnect();
}

testCheckoutFlow().catch(console.error);
