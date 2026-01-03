import { prisma } from '../lib/prisma';

async function setVendorPending() {
  // Set first vendor to pending
  const vendor = await prisma.vendor.findFirst();

  if (vendor) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { isApproved: false },
    });

    console.log('✅ Vendor set to PENDING for testing!');
    console.log('Business:', vendor.businessName);
    console.log('Now refresh /admin/vendors?page=pending to see approve buttons');
  } else {
    console.log('No vendors found');
  }
}

setVendorPending()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
