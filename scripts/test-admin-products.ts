import { prisma } from '../lib/prisma';

async function testAdminProductsPage() {
  console.log('=== Testing Admin Products Page ===\n');

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

  // 2. Get all products
  console.log('=== 2. Fetching All Products ===');
  const allProducts = await prisma.product.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total Products: ${allProducts.length}\n`);

  // 3. Display products
  console.log('=== 3. All Products ===');
  for (const product of allProducts) {
    console.log(`📦 ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Price: $${product.price.toFixed(2)}`);
    console.log(`   Stock: ${product.stock}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Featured: ${product.featured ? 'Yes' : 'No'}`);
    console.log(`   Vendor: ${product.vendor.businessName} (${product.vendor.user.name})`);
    console.log(`   Orders: ${product._count.orderItems}`);
    console.log(`   Reviews: ${product._count.reviews}`);
    console.log(`   Image: ${product.image || 'No image'}`);
    console.log('');
  }

  // 4. Filter tests
  console.log('=== 4. Filter Tests ===');

  // Category filter
  const categories = [...new Set(allProducts.map(p => p.category))];
  console.log('Category Filter:');
  for (const cat of categories) {
    const count = allProducts.filter(p => p.category === cat).length;
    console.log(`  ?category=${cat}: ${count} product(s)`);
  }

  // Stock filter
  const inStock = allProducts.filter(p => p.stock > 0);
  const outOfStock = allProducts.filter(p => p.stock === 0);
  console.log(`\nStock Filter:`);
  console.log(`  ?inStock=true: ${inStock.length} products`);
  console.log(`  ?inStock=false: ${outOfStock.length} products`);

  // Featured filter
  const featured = allProducts.filter(p => p.featured);
  console.log(`\nFeatured Filter:`);
  console.log(`  ?featured=true: ${featured.length} products`);

  // 5. Search test
  console.log('\n=== 5. Search Test ===');
  const searchTerm = 'wireless';
  const searchResults = allProducts.filter(
    p => p.name.toLowerCase().includes(searchTerm) ||
         p.description?.toLowerCase().includes(searchTerm)
  );
  console.log(`Search "${searchTerm}": ${searchResults.length} result(s)`);
  for (const p of searchResults) {
    console.log(`  - ${p.name}`);
  }

  // 6. Products by vendor
  console.log('\n=== 6. Products by Vendor ===');
  const vendorGroups: Record<string, any[]> = {};
  for (const product of allProducts) {
    if (!vendorGroups[product.vendor.businessName]) {
      vendorGroups[product.vendor.businessName] = [];
    }
    vendorGroups[product.vendor.businessName].push(product);
  }

  for (const [vendorName, products] of Object.entries(vendorGroups)) {
    console.log(`${vendorName}: ${products.length} product(s)`);
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    console.log(`  Total value: $${totalValue.toFixed(2)}`);
  }

  // 7. Low stock products
  console.log('\n=== 7. Low Stock Products ===');
  const lowStock = allProducts.filter(p => p.stock < 5 && p.stock > 0);
  console.log(`Products with stock < 5: ${lowStock.length}`);
  for (const p of lowStock) {
    console.log(`  ⚠️  ${p.name}: ${p.stock} left`);
  }

  // 8. Out of stock products
  console.log('\n=== 8. Out of Stock Products ===');
  console.log(`Products out of stock: ${outOfStock.length}`);
  for (const p of outOfStock) {
    console.log(`  🔴 ${p.name}`);
  }

  // 9. Featured products
  console.log('\n=== 9. Featured Products ===');
  console.log(`Featured products: ${featured.length}`);
  for (const p of featured) {
    console.log(`  ⭐ ${p.name} - $${p.price.toFixed(2)}`);
  }

  // 10. API endpoints test
  console.log('\n=== 10. API Endpoints Structure ===');
  console.log('GET /api/admin/products');
  console.log('  Query params:');
  console.log('    - category: Filter by category');
  console.log('    - search: Search in name/description');
  console.log('    - vendorId: Filter by vendor');
  console.log('    - featured: Filter featured (true/false)');
  console.log('    - inStock: Filter by stock status (true/false)');
  console.log('    - limit: Pagination limit (default: 50)');
  console.log('    - offset: Pagination offset');
  console.log('');
  console.log('PATCH /api/admin/products');
  console.log('  Body: { productId, isFeatured?, stock?, price? }');
  console.log('');
  console.log('DELETE /api/admin/products');
  console.log('  Body: { productId }');
  console.log('  Validates: Product exists, no active orders');

  // 11. Test product update
  console.log('\n=== 11. Testing Product Update ===');
  const testProduct = allProducts[0];
  if (testProduct) {
    console.log(`Product: ${testProduct.name}`);
    console.log(`Current: Price=$${testProduct.price}, Stock=${testProduct.stock}, Featured=${testProduct.featured}`);

    // Test update
    const updatedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: {
        featured: !testProduct.featured,
      },
    });

    console.log(`Updated: Price=$${updatedProduct.price}, Stock=${updatedProduct.stock}, Featured=${updatedProduct.featured}`);

    // Revert
    await prisma.product.update({
      where: { id: testProduct.id },
      data: {
        featured: testProduct.featured,
      },
    });
    console.log(`✅ Reverted to original state`);
  }

  // 12. Pagination
  console.log('\n=== 12. Pagination ===');
  const limit = 20;
  const total = allProducts.length;
  const totalPages = Math.ceil(total / limit);
  const hasMore = total > limit;

  console.log(`Total Products: ${total}`);
  console.log(`Page Limit: ${limit}`);
  console.log(`Total Pages: ${totalPages}`);
  console.log(`Has More: ${hasMore}`);

  // 13. Product statistics
  console.log('\n=== 13. Product Statistics ===');
  const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);
  const avgPrice = allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length;
  const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

  console.log(`Total Stock: ${totalStock} units`);
  console.log(`Average Price: $${avgPrice.toFixed(2)}`);
  console.log(`Total Inventory Value: $${totalValue.toFixed(2)}`);
  console.log(`Products with Orders: ${allProducts.filter(p => p._count.orderItems > 0).length}`);

  // 14. Page URLs
  console.log('\n=== 14. Page URLs ===');
  console.log('Admin Products: http://localhost:3001/admin/products');
  console.log('API: http://localhost:3001/api/admin/products');

  console.log('\n✅ Admin Products Page test complete!');

  await prisma.$disconnect();
}

testAdminProductsPage().catch(console.error);
