import { prisma } from '../lib/prisma';

async function checkVendors() {
  const vendors = await prisma.vendor.findMany({
    include: { user: true },
  });

  console.log('=== VENDORS IN DATABASE ===');
  console.log('Total vendors:', vendors.length);
  console.log('');

  vendors.forEach((vendor) => {
    console.log('Business:', vendor.businessName);
    console.log('Email:', vendor.user.email);
    console.log('Is Approved:', vendor.isApproved);
    console.log('---');
  });
}

checkVendors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
