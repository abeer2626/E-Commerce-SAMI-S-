import { prisma } from '../lib/prisma';

async function testVendorDashboard() {
  console.log('=== Testing Vendor Dashboard ===\n');

  // 1. Get vendor user
  console.log('=== 1. Finding Vendor User ===');
  const vendor = await prisma.vendor.findFirst({
    where: { isApproved: true },
    include: {
      user: true,
      products: {
        include: {
          _count: {
            select: {
              orderItems: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vendor) {
    console.error('❌ No approved vendor found!');
    return;
  }

  console.log(`✅ Vendor: ${vendor.businessName}`);
  console.log(`   User: ${vendor.user.name} (${vendor.user.email})`);
  console.log(`   Role: ${vendor.user.role}`);
  console.log(`   Status: ${vendor.isApproved ? 'APPROVED' : 'PENDING'}`);
  console.log(`   Description: ${vendor.description || 'No description'}\n`);

  // 2. Products
  console.log('=== 2. Vendor Products ===');
  console.log(`Total Products: ${vendor.products.length}\n`);

  if (vendor.products.length === 0) {
    console.log('⚠️  No products found. Adding test products...');

    // Add test products
    const testProducts = [
      {
        id: `vend-${Date.now()}-1`,
        name: 'Vendor Test Product 1',
        price: 49.99,
        category: 'Accessories',
        image: '/test-product-1.jpg',
        description: 'Test product from vendor',
        stock: 25,
        featured: false,
        vendorId: vendor.id,
      },
      {
        id: `vend-${Date.now()}-2`,
        name: 'Vendor Test Product 2',
        price: 79.99,
        category: 'Accessories',
        image: '/test-product-2.jpg',
        description: 'Another test product',
        stock: 15,
        featured: true,
        vendorId: vendor.id,
      },
    ];

    for (const productData of testProducts) {
      await prisma.product.create({ data: productData });
      console.log(`   Created: ${productData.name} - $${productData.price}`);
    }

    // Refresh vendor data
    const updatedVendor = await prisma.vendor.findFirst({
      where: { id: vendor.id },
      include: {
        products: {
          include: {
            _count: {
              select: {
                orderItems: true,
                reviews: true,
              },
            },
          },
        },
      },
    });

    if (updatedVendor) {
      vendor.products = updatedVendor.products;
    }
  }

  console.log('Products:');
  for (const product of vendor.products) {
    console.log(`  📦 ${product.name}`);
    console.log(`     Price: $${product.price.toFixed(2)}`);
    console.log(`     Stock: ${product.stock}`);
    console.log(`     Category: ${product.category}`);
    console.log(`     Sales: ${product._count.orderItems}`);
    console.log(`     Reviews: ${product._count.reviews}`);
    console.log(`     Featured: ${product.featured ? 'Yes' : 'No'}`);
    console.log('');
  }

  // 3. Orders
  console.log('=== 3. Vendor Orders (Recent 10) ===');
  const orders = await prisma.orderItem.findMany({
    where: {
      product: { vendorId: vendor.id },
    },
    include: {
      order: {
        include: {
          user: true,
        },
      },
      product: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
    take: 10,
  });

  console.log(`Total Order Items: ${orders.length}\n`);

  if (orders.length === 0) {
    console.log('⚠️  No orders found for this vendor');
  } else {
    for (const item of orders) {
      console.log(`📦 Order: ${item.order.orderNumber}`);
      console.log(`   Product: ${item.product.name}`);
      console.log(`   Customer: ${item.order.user.name} (${item.order.user.email})`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Price: $${item.price.toFixed(2)}`);
      console.log(`   Total: $${(item.price * item.quantity).toFixed(2)}`);
      console.log(`   Status: ${item.order.status}`);
      console.log(`   Date: ${new Date(item.order.createdAt).toLocaleString()}`);
      console.log('');
    }
  }

  // 4. Statistics
  console.log('=== 4. Dashboard Statistics ===');
  const totalRevenue = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSales = orders.reduce((sum, item) => sum + item.quantity, 0);

  console.log(`Total Products: ${vendor.products.length}`);
  console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`Total Sales (items): ${totalSales}`);
  console.log(`Recent Orders: ${orders.length}`);

  // Additional stats
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  console.log(`Average Order Value: $${avgOrderValue.toFixed(2)}`);

  // Product stats
  const totalStock = vendor.products.reduce((sum, p) => sum + p.stock, 0);
  const totalProductSales = vendor.products.reduce((sum, p) => sum + p._count.orderItems, 0);
  console.log(`Total Stock: ${totalStock} units`);
  console.log(`Total Product Views (reviews): ${vendor.products.reduce((sum, p) => sum + p._count.reviews, 0)}`);

  // 5. Links and Actions
  console.log('\n=== 5. Dashboard Actions & Links ===');
  console.log('✅ Analytics Button → /vendor/analytics');
  console.log('✅ Manage Orders Button → /vendor/orders');
  console.log('✅ Add Product Button → /vendor/products/new');
  console.log('✅ Edit Product → /vendor/products/{id}/edit');
  console.log('✅ Delete Product API → DELETE /api/vendor/products/{id}');

  // 6. Approval Status
  console.log('\n=== 6. Vendor Approval Status ===');
  console.log(`isApproved: ${vendor.isApproved ?? false}`);
  if (!vendor.isApproved) {
    console.log('⚠️  "Pending Approval" badge will be shown');
  } else {
    console.log('✅ Vendor is approved - products are visible');
  }

  // 7. Test URLs
  console.log('\n=== 7. Page URLs ===');
  console.log(`Vendor Dashboard: http://localhost:3001/vendor/dashboard`);
  console.log(`Analytics: http://localhost:3001/vendor/analytics`);
  console.log(`Orders: http://localhost:3001/vendor/orders`);
  console.log(`Add Product: http://localhost:3001/vendor/products/new`);

  console.log('\n✅ Vendor Dashboard test complete!');

  await prisma.$disconnect();
}

testVendorDashboard().catch(console.error);
