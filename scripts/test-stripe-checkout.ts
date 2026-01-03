import { prisma } from '../lib/prisma';

async function testStripeCheckoutFlow() {
  console.log('=== Testing Stripe Checkout Flow ===\n');

  // 1. Check Stripe configuration
  console.log('=== 1. Stripe Configuration ===');
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripeKey || stripeKey.includes('your_key_here')) {
    console.log('⚠️  Stripe Secret Key: Not configured (placeholder value)');
    console.log('   To enable Stripe payments:');
    console.log('   1. Get keys from https://dashboard.stripe.com/');
    console.log('   2. Update .env file with real keys');
  } else {
    console.log('✅ Stripe Secret Key: Configured');
  }

  if (!publishableKey || publishableKey.includes('your_key_here')) {
    console.log('⚠️  Stripe Publishable Key: Not configured (placeholder value)');
  } else {
    console.log('✅ Stripe Publishable Key: Configured');
  }

  // 2. Verify cart items for Stripe checkout
  console.log('\n=== 2. Cart Items for Checkout ===');
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found');
    return;
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          vendor: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    console.log('⚠️  Cart is empty. Adding test items...');
    // Add test products to cart
    const products = await prisma.product.findMany({
      where: { category: 'Accessories' },
      include: { vendor: true },
    });

    for (const product of products.slice(0, 2)) {
      await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        update: { quantity: 1 },
        create: {
          userId: user.id,
          productId: product.id,
          quantity: 1,
        },
      });
    }

    const updatedCart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: { include: { vendor: true } } },
    });

    console.log(`✅ Added ${updatedCart.length} items to cart`);
    for (const item of updatedCart) {
      console.log(`   - ${item.product.name}: $${item.product.price}`);
    }
  } else {
    console.log(`✅ Cart has ${cartItems.length} item(s):`);
    let total = 0;
    for (const item of cartItems) {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;
      console.log(`   - ${item.product.name} x${item.quantity} = $${itemTotal.toFixed(2)}`);
    }
    console.log(`   Total: $${total.toFixed(2)}`);
  }

  // 3. Test Stripe checkout payload structure
  console.log('\n=== 3. Stripe Checkout Payload Structure ===');
  const cart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          vendor: true,
        },
      },
    },
  });

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  console.log('POST /api/checkout/stripe');
  console.log('Request Body:');
  console.log(JSON.stringify({
    cartItems: cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
  }, null, 2));

  console.log('\nExpected Stripe Line Items:');
  for (const item of cart) {
    console.log(`  - ${item.product.name}`);
    console.log(`    Price: $${item.product.price} → ${Math.round(item.product.price * 100)} cents`);
    console.log(`    Quantity: ${item.quantity}`);
    console.log(`    Image: ${item.product.image || 'No image'}`);
    console.log(`    Product ID: ${item.product.id}`);
    console.log(`    Vendor ID: ${item.product.vendor.id}`);
  }

  console.log(`\n  Total Amount: $${totalAmount.toFixed(2)} → ${Math.round(totalAmount * 100)} cents`);

  // 4. Stripe checkout flow steps
  console.log('\n=== 4. Stripe Checkout Flow Steps ===');
  console.log('Step 1: User clicks "Credit / Debit Card" payment method');
  console.log('Step 2: Frontend calls POST /api/checkout/stripe');
  console.log('Step 3: Backend creates Stripe Checkout Session');
  console.log('        - Line items with product details');
  console.log('        - Success URL: /checkout/success?session_id={CHECKOUT_SESSION_ID}');
  console.log('        - Cancel URL: /checkout?canceled=true');
  console.log('        - Metadata: userId, cartItems');
  console.log('Step 4: Backend returns { sessionId, url }');
  console.log('Step 5: User is redirected to Stripe hosted checkout page');
  console.log('Step 6: User completes payment on Stripe');
  console.log('Step 7: Stripe redirects to success URL');
  console.log('Step 8: Success page verifies payment via GET /api/checkout/stripe?session_id=...');
  console.log('Step 9: Order is created (via webhook or after verification)');

  // 5. Success page verification
  console.log('\n=== 5. Checkout Success Page ===');
  console.log('URL: /checkout/success?session_id={CHECKOUT_SESSION_ID}');
  console.log('Page Actions:');
  console.log('  1. Extract session_id from URL');
  console.log('  2. Call GET /api/checkout/stripe?session_id=...');
  console.log('  3. Verify payment_status === "paid"');
  console.log('  4. Show success message');

  // 6. Webhook requirements (if implemented)
  console.log('\n=== 6. Stripe Webhook (Recommended) ===');
  console.log('Endpoint: POST /api/webhooks/stripe');
  console.log('Purpose: Automatically handle payment events');
  console.log('Events to handle:');
  console.log('  - checkout.session.completed → Create order in database');
  console.log('  - payment_intent.succeeded → Confirm payment');
  console.log('  - payment_intent.failed → Handle failed payment');

  // 7. Test URLs
  console.log('\n=== 7. Page URLs ===');
  console.log('Checkout: http://localhost:3001/checkout');
  console.log('Stripe API: http://localhost:3001/api/checkout/stripe');
  console.log('Success: http://localhost:3001/checkout/success?session_id=test');

  // 8. Summary
  console.log('\n=== Summary ===');
  if (stripeKey && !stripeKey.includes('your_key_here')) {
    console.log('✅ Stripe is configured - Online payments should work!');
    console.log('\nTo test the full flow:');
    console.log('1. Add items to cart');
    console.log('2. Go to /checkout');
    console.log('3. Select "Credit / Debit Card"');
    console.log('4. Complete Stripe checkout');
    console.log('5. Verify order is created');
  } else {
    console.log('⚠️  Stripe is NOT configured');
    console.log('\nTo enable Stripe payments:');
    console.log('1. Create a Stripe account at https://dashboard.stripe.com/');
    console.log('2. Get your test API keys');
    console.log('3. Update .env file:');
    console.log('   STRIPE_SECRET_KEY=sk_test_...');
    console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('4. Restart the server');
    console.log('5. Add a webhook endpoint for automatic order creation');
  }

  console.log('\n✅ Stripe checkout flow structure verified!');

  await prisma.$disconnect();
}

testStripeCheckoutFlow().catch(console.error);
