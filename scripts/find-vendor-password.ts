import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function findVendorWithPassword() {
  const vendors = await prisma.vendor.findMany({
    include: { user: { select: { id: true, email: true, name: true, password: true } } },
  });

  console.log('=== CHECKING VENDOR ACCOUNTS ===\n');

  for (const vendor of vendors) {
    console.log(`Business: ${vendor.businessName}`);
    console.log(`Email: ${vendor.user.email}`);
    console.log(`Has Password: ${vendor.user.password ? 'YES' : 'NO'}`);

    if (vendor.user.password) {
      console.log(`✅ This vendor can sign in!`);
      console.log(`Login: ${vendor.user.email}`);
    } else {
      console.log(`❌ No password set - setting one now...`);

      // Set a default password
      const hashedPassword = await bcrypt.hash('vendor123', 10);

      await prisma.user.update({
        where: { id: vendor.user.id },
        data: { password: hashedPassword },
      });

      console.log(`✅ Password set! Login: ${vendor.user.email}`);
      console.log(`   Password: vendor123`);
    }

    console.log('---');
  }

  await prisma.$disconnect();
}

findVendorWithPassword().catch(console.error);
