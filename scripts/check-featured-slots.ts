import { prisma } from '../lib/prisma';

async function checkFeaturedSlots() {
  const slots = await prisma.featuredSlot.findMany({
    include: {
      product: { select: { id: true, name: true } },
      vendor: { select: { businessName: true } },
    },
  });

  const now = new Date();

  console.log('=== FEATURED SLOTS IN DATABASE ===\n');
  console.log(`Total slots: ${slots.length}\n`);

  slots.forEach((slot) => {
    const isActive = slot.status === 'ACTIVE';
    const hasStarted = new Date(slot.startDate) <= now;
    const notExpired = new Date(slot.endDate) >= now;

    console.log(`Position: ${slot.position}`);
    console.log(`Slot: #${slot.slotNumber}`);
    console.log(`Product: ${slot.product.name}`);
    console.log(`Vendor: ${slot.vendor.businessName}`);
    console.log(`Price: Rs. ${slot.price.toLocaleString()}`);
    console.log(`Status: ${slot.status}`);
    console.log(`Dates: ${slot.startDate.toISOString().split('T')[0]} to ${slot.endDate.toISOString().split('T')[0]}`);
    console.log(`Active: ${isActive}`);
    console.log(`Current: ${hasStarted ? 'Started' : 'Future'} - ${notExpired ? 'Valid' : 'Expired'}`);
    console.log(`isPaid: ${slot.isPaid}`);
    console.log(`---`);
  });

  // Check why API returns empty
  const apiSlots = await prisma.featuredSlot.findMany({
    where: {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      product: { select: { id: true, name: true } },
    },
  });

  console.log(`\n🔍 API Query Results: ${apiSlots.length} slots`);
  apiSlots.forEach((s) => {
    console.log(`   - ${s.position} Slot #${s.slotNumber}: ${s.product.name}`);
  });

  await prisma.$disconnect();
}

checkFeaturedSlots().catch(console.error);
