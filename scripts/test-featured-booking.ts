import { prisma } from '../lib/prisma';

async function testVendorFeaturedFlow() {
  console.log('=== VENDOR FEATURED BOOKING FLOW TEST ===\n');

  // 1. Get vendor
  const vendor = await prisma.vendor.findFirst({
    include: {
      user: { select: { id: true, email: true, name: true } },
      products: { select: { id: true, name: true, price: true } },
    },
  });

  if (!vendor) {
    console.log('❌ No vendor found!');
    return;
  }

  console.log('✅ Vendor Found:');
  console.log(`   Business: ${vendor.businessName}`);
  console.log(`   Email: ${vendor.user.email}`);
  console.log(`   Products: ${vendor.products.length}\n`);

  // 2. Check products
  console.log('📦 Available Products:');
  vendor.products.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - $${p.price}`);
  });

  // 3. Check available slots
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const positions = ['HOMEPAGE_HERO', 'HOMEPAGE_GRID', 'CATEGORY_TOP', 'CATEGORY_SIDEBAR'];

  console.log('\n🎯 Available Slots:');
  for (const position of positions) {
    const slots = await prisma.featuredSlot.findMany({
      where: {
        position,
        status: 'ACTIVE',
        startDate: { lte: tomorrow },
        endDate: { gte: tomorrow },
      },
    });

    const bookedSlots = slots.map((s) => s.slotNumber);
    console.log(`\n   ${position}:`);
    console.log(`   Booked: ${bookedSlots.length > 0 ? bookedSlots.join(', ') : 'None'}`);
    console.log(`   Available: All slots are open!`);
  }

  // 4. Calculate pricing
  const prices: Record<string, number> = {
    HOMEPAGE_HERO: 5000,
    HOMEPAGE_GRID: 3000,
    CATEGORY_TOP: 2000,
    CATEGORY_SIDEBAR: 2000,
  };

  console.log('\n💰 Pricing (PKR/week):');
  for (const [pos, price] of Object.entries(prices)) {
    console.log(`   ${pos}: Rs. ${price.toLocaleString()}`);
  }

  // 5. Test booking data preparation
  if (vendor.products.length > 0) {
    const testProduct = vendor.products[0];
    const testPosition = 'HOMEPAGE_HERO';
    const testSlot = 1;
    const duration = 1;
    const startDate = tomorrow.toISOString().split('T')[0];
    const totalPrice = prices[testPosition] * duration;

    console.log('\n📝 Test Booking Data:');
    console.log(`   Product: ${testProduct.name}`);
    console.log(`   Position: ${testPosition}`);
    console.log(`   Slot: #${testSlot}`);
    console.log(`   Start Date: ${startDate}`);
    console.log(`   Duration: ${duration} week`);
    console.log(`   Total Price: Rs. ${totalPrice.toLocaleString()}`);

    console.log('\n✅ Ready to book!');
    console.log(`\n🔗 API Test Command:`);
    console.log(`curl -X POST http://localhost:3001/api/admin/featured \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{`);
    console.log(`    "productId": "${testProduct.id}",`);
    console.log(`    "position": "${testPosition}",`);
    console.log(`    "slotNumber": ${testSlot},`);
    console.log(`    "startDate": "${startDate}",`);
    console.log(`    "duration": ${duration}`);
    console.log(`  }'`);
  }

  // 6. Check existing bookings
  const myBookings = await prisma.featuredSlot.findMany({
    where: { vendorId: vendor.id },
    include: {
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📋 My Current Bookings: ${myBookings.length}`);
  myBookings.forEach((booking, i) => {
    const isExpired = new Date(booking.endDate) < now;
    console.log(`   ${i + 1}. ${booking.product.name}`);
    console.log(`      Position: ${booking.position}`);
    console.log(`      Price: Rs. ${booking.price.toLocaleString()}`);
    console.log(`      Status: ${booking.isPaid ? 'PAID ✅' : 'Pending 💳'}`);
    console.log(`      Active: ${!isExpired ? 'YES ✅' : 'Expired ❌'}`);
  });

  await prisma.$disconnect();
  console.log('\n=== TEST COMPLETE ===');
}

testVendorFeaturedFlow().catch(console.error);
