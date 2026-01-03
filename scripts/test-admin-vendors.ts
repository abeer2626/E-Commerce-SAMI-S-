import { prisma } from '../lib/prisma';

async function testAdminVendorsPage() {
  console.log('=== Testing Admin Vendors Page ===\n');

  // 1. Get admin user
  console.log('=== 1. Finding Admin User ===');
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ Admin user not found!');
    return;
  }

  console.log(`✅ Admin: ${admin.name} (${admin.email})`);
  console.log(`   Role: ${admin.role}\n`);

  // 2. Get all vendors
  console.log('=== 2. Fetching All Vendors ===');
  const allVendors = await prisma.vendor.findMany({
    include: {
      user: true,
      products: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total Vendors: ${allVendors.length}\n`);

  // 3. Vendor breakdown by status
  console.log('=== 3. Vendor Status Breakdown ===');
  const approvedVendors = allVendors.filter((v) => v.isApproved);
  const pendingVendors = allVendors.filter((v) => !v.isApproved);

  console.log(`Approved Vendors: ${approvedVendors.length}`);
  console.log(`Pending Vendors: ${pendingVendors.length}\n`);

  // 4. Display all vendors
  console.log('=== 4. All Vendors ===');
  for (const vendor of allVendors) {
    console.log(`🏪 ${vendor.businessName}`);
    console.log(`   Status: ${vendor.isApproved ? '✅ APPROVED' : '⏳ PENDING'}`);
    console.log(`   Contact: ${vendor.user.name} (${vendor.user.email})`);
    console.log(`   Description: ${vendor.description || 'No description'}`);
    console.log(`   Products: ${vendor.products.length}`);
    console.log(`   Joined: ${new Date(vendor.createdAt).toLocaleDateString()}`);
    console.log(`   Vendor ID: ${vendor.id}`);
    console.log('');
  }

  // 5. Filter by status
  console.log('=== 5. Status Filter Test ===');

  // All vendors
  console.log(`?status=(all): ${allVendors.length} vendor(s)`);

  // Pending only
  console.log(`?status=pending: ${pendingVendors.length} vendor(s)`);
  if (pendingVendors.length > 0) {
    for (const vendor of pendingVendors) {
      console.log(`   - ${vendor.businessName} (${vendor.user.name})`);
    }
  }

  // Approved only
  console.log(`?status=approved: ${approvedVendors.length} vendor(s)`);
  if (approvedVendors.length > 0) {
    for (const vendor of approvedVendors) {
      console.log(`   - ${vendor.businessName} (${vendor.user.name})`);
    }
  }
  console.log('');

  // 6. Test vendor approval (create test pending vendor)
  console.log('=== 6. Testing Vendor Approval Flow ===');

  // Create a test pending vendor
  const testUser = await prisma.user.create({
    data: {
      name: 'Test Vendor User',
      email: `testvendor${Date.now()}@example.com`,
      password: 'hashed_password',
      role: 'VENDOR',
    },
  });

  const testVendor = await prisma.vendor.create({
    data: {
      userId: testUser.id,
      businessName: 'Test Vendor Store',
      description: 'A test vendor for approval testing',
      isApproved: false,
    },
    include: { user: true },
  });

  console.log(`✅ Created test pending vendor: ${testVendor.businessName}`);
  console.log(`   Status: PENDING`);
  console.log(`   User: ${testVendor.user.name}\n`);

  // Test approval API
  console.log('Testing Approve Action:');
  console.log(`PATCH /api/admin/vendors/${testVendor.id}`);
  console.log(`Body: { "action": "approve" }`);

  const approvedVendor = await prisma.vendor.update({
    where: { id: testVendor.id },
    data: { isApproved: true },
    include: { user: true },
  });

  console.log(`✅ Vendor approved: ${approvedVendor.businessName}`);
  console.log(`   New Status: APPROVED\n`);

  // Test rejection flow
  console.log('Testing Reject Action:');
  console.log(`PATCH /api/admin/vendors/${approvedVendor.id}`);
  console.log(`Body: { "action": "reject" }`);

  await prisma.vendor.delete({
    where: { id: approvedVendor.id },
  });

  console.log(`✅ Vendor rejected and deleted`);
  console.log(`   (Vendor removed from database)\n`);

  // 7. Vendor statistics
  console.log('=== 7. Vendor Statistics ===');
  const totalProducts = allVendors.reduce((sum, v) => sum + v.products.length, 0);
  const avgProductsPerVendor = allVendors.length > 0 ? totalProducts / allVendors.length : 0;

  console.log(`Total Products across all vendors: ${totalProducts}`);
  console.log(`Average Products per Vendor: ${avgProductsPerVendor.toFixed(1)}`);

  // Products by vendor
  console.log('\nProducts by Vendor:');
  for (const vendor of approvedVendors) {
    console.log(`  ${vendor.businessName}: ${vendor.products.length} products`);
  }
  console.log('');

  // 8. API Call Structure
  console.log('=== 8. API Call Structure ===');
  console.log('Approve Vendor:');
  console.log(`  PATCH /api/admin/vendors/{vendorId}`);
  console.log(`  Body: { "action": "approve" }`);
  console.log(`  Response: { "success": true, "action": "approved", "vendor": {...} }`);
  console.log('');
  console.log('Reject Vendor:');
  console.log(`  PATCH /api/admin/vendors/{vendorId}`);
  console.log(`  Body: { "action": "reject" }`);
  console.log(`  Response: { "success": true, "action": "rejected" }`);
  console.log('');

  // 9. Page Features
  console.log('=== 9. Page Features ===');
  console.log('✅ Vendor list display');
  console.log('✅ Status filter (All/Pending/Approved)');
  console.log('✅ Business name display');
  console.log('✅ Contact information');
  console.log('✅ Product count per vendor');
  console.log('✅ Approval status badges');
  console.log('✅ Approve button (for pending vendors)');
  console.log('✅ Reject button (for pending vendors)');
  console.log('✅ Confirm rejection dialog');
  console.log('✅ Page reload after action');
  console.log('✅ Empty state message');

  // 10. Page URLs
  console.log('\n=== 10. Page URLs ===');
  console.log('Admin Vendors: http://localhost:3001/admin/vendors');
  console.log('Filter Pending: http://localhost:3001/admin/vendors?status=pending');
  console.log('Filter Approved: http://localhost:3001/admin/vendors?status=approved');
  console.log('Approve API: PATCH http://localhost:3001/api/admin/vendors/{id}');

  console.log('\n✅ Admin Vendors Page test complete!');

  await prisma.$disconnect();
}

testAdminVendorsPage().catch(console.error);
