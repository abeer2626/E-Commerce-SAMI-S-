import { prisma } from '../lib/prisma';

async function createTestBooking() {
  console.log('=== CREATING TEST BOOKING ===\n');

  // Get vendor and first product
  const vendor = await prisma.vendor.findFirst({
    include: { products: true },
  });

  if (!vendor || vendor.products.length === 0) {
    console.log('❌ No vendor or products found!');
    return;
  }

  const product = vendor.products[0];

  // Create a featured slot booking
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Tomorrow

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7); // 1 week later

  const featuredSlot = await prisma.featuredSlot.create({
    data: {
      productId: product.id,
      vendorId: vendor.id,
      position: 'HOMEPAGE_HERO',
      slotNumber: 1,
      startDate,
      endDate,
      price: 5000, // Rs. 5000 per week
      status: 'ACTIVE',
      isPaid: false, // Pending payment
    },
    include: {
      product: { select: { id: true, name: true, price: true, image: true } },
      vendor: { select: { id: true, businessName: true } },
    },
  });

  console.log('✅ Booking Created Successfully!\n');
  console.log(`📦 Product: ${featuredSlot.product.name}`);
  console.log(`💰 Price: Rs. ${featuredSlot.price.toLocaleString()}`);
  console.log(`📅 Start: ${featuredSlot.startDate.toISOString().split('T')[0]}`);
  console.log(`📅 End: ${featuredSlot.endDate.toISOString().split('T')[0]}`);
  console.log(`📍 Position: ${featuredSlot.position} Slot #${featuredSlot.slotNumber}`);
  console.log(`💳 Payment Status: ${featuredSlot.isPaid ? 'PAID' : 'Pending'}`);

  await prisma.$disconnect();
  console.log('\n=== TEST BOOKING COMPLETE ===');
}

createTestBooking().catch(console.error);
