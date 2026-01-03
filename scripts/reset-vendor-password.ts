import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function resetVendorPassword() {
  const newPassword = await bcrypt.hash('Vendor123!', 10);

  // Reset first vendor's password
  const vendor = await prisma.vendor.findFirst({
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!vendor) {
    console.log('No vendor found!');
    return;
  }

  await prisma.user.update({
    where: { id: vendor.user.id },
    data: { password: newPassword },
  });

  console.log('=== VENDOR PASSWORD RESET ===\n');
  console.log(`Email: ${vendor.user.email}`);
  console.log(`Password: Vendor123!`);
  console.log(`\nBusiness: ${vendor.businessName}`);
  console.log(`\nSign in at: http://localhost:3001/auth/signin`);

  await prisma.$disconnect();
}

resetVendorPassword().catch(console.error);
