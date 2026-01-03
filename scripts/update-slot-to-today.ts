import { prisma } from '../lib/prisma';

async function updateSlotToToday() {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const slot = await prisma.featuredSlot.findFirst();

  if (slot) {
    await prisma.featuredSlot.update({
      where: { id: slot.id },
      data: {
        startDate: now,
        endDate: endOfWeek,
      },
    });

    console.log('✅ Featured slot updated to start today!\n');
    console.log(`Start: ${now.toISOString().split('T')[0]}`);
    console.log(`End: ${endOfWeek.toISOString().split('T')[0]}`);
    console.log(`\nProduct: ${slot.productId}`);
    console.log(`Position: ${slot.position}`);
    console.log(`Price: Rs. ${slot.price}`);
  } else {
    console.log('No featured slot found');
  }

  await prisma.$disconnect();
}

updateSlotToToday().catch(console.error);
