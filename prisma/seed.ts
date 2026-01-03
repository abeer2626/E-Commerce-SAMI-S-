import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storehub.com' },
    update: {},
    create: {
      email: 'admin@storehub.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create vendor users
  const vendor1Password = await bcrypt.hash('vendor123', 10);
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor1@storehub.com' },
    update: {},
    create: {
      email: 'vendor1@storehub.com',
      name: 'John Smith',
      password: vendor1Password,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Tech Essentials',
          description: 'Quality tech products for everyday needs',
          isApproved: true,
        },
      },
    },
  });

  const vendor2Password = await bcrypt.hash('vendor123', 10);
  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor2@storehub.com' },
    update: {},
    create: {
      email: 'vendor2@storehub.com',
      name: 'Sarah Johnson',
      password: vendor2Password,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Fashion Hub',
          description: 'Trendy fashion and accessories',
          isApproved: true,
        },
      },
    },
  });

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Doe',
      password: customerPassword,
      role: 'USER',
    },
  });

  // Get vendor IDs
  const vendors = await prisma.vendor.findMany();
  const techVendor = vendors.find((v) => v.businessName === 'Tech Essentials')!;
  const fashionVendor = vendors.find((v) => v.businessName === 'Fashion Hub')!;

  // Create products for Tech Essentials
  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium sound quality with active noise cancellation and 30-hour battery life.',
        price: 79.99,
        category: 'Electronics',
        stock: 50,
        featured: true,
        vendorId: techVendor.id,
      },
      {
        name: 'USB-C Hub Multiport Adapter',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.',
        price: 39.99,
        category: 'Electronics',
        stock: 100,
        featured: true,
        vendorId: techVendor.id,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches.',
        price: 89.99,
        category: 'Electronics',
        stock: 30,
        featured: false,
        vendorId: techVendor.id,
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking.',
        price: 24.99,
        category: 'Electronics',
        stock: 75,
        featured: false,
        vendorId: techVendor.id,
      },
      {
        name: '4K Ultra HD Monitor',
        description: '27-inch 4K display with HDR support and 60Hz refresh rate.',
        price: 299.99,
        category: 'Electronics',
        stock: 20,
        featured: true,
        vendorId: techVendor.id,
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Track your health and fitness with this advanced smartwatch.',
        price: 149.99,
        category: 'Electronics',
        stock: 45,
        featured: true,
        vendorId: techVendor.id,
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'High capacity power bank with fast charging support.',
        price: 34.99,
        category: 'Electronics',
        stock: 120,
        featured: false,
        vendorId: techVendor.id,
      },
      {
        name: 'Wireless Earbuds Pro',
        description: 'True wireless earbuds with active noise cancellation.',
        price: 99.99,
        category: 'Electronics',
        stock: 60,
        featured: true,
        vendorId: techVendor.id,
      },
      {
        name: 'Laptop Stand Adjustable',
        description: 'Ergonomic aluminum laptop stand with height adjustment.',
        price: 29.99,
        category: 'Accessories',
        stock: 80,
        featured: false,
        vendorId: techVendor.id,
      },
      {
        name: 'Webcam 1080p HD',
        description: 'Full HD webcam with auto focus and built-in microphone.',
        price: 44.99,
        category: 'Electronics',
        stock: 55,
        featured: false,
        vendorId: techVendor.id,
      },
    ],
  });

  // Create products for Fashion Hub
  await prisma.product.createMany({
    data: [
      {
        name: 'Classic Leather Belt',
        description: 'Genuine leather belt with brushed metal buckle.',
        price: 29.99,
        category: 'Accessories',
        stock: 60,
        featured: true,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Canvas Backpack',
        description: 'Durable canvas backpack with laptop compartment.',
        price: 49.99,
        category: 'Accessories',
        stock: 40,
        featured: true,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Polarized Aviator',
        description: 'UV400 protection polarized aviator sunglasses with metal frame.',
        price: 34.99,
        category: 'Accessories',
        stock: 80,
        featured: true,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Cat Eye Edition',
        description: 'Trendy cat-eye style sunglasses with UV protection.',
        price: 29.99,
        category: 'Accessories',
        stock: 65,
        featured: true,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Sport Wrap',
        description: 'Polarized sport sunglasses with wraparound frame.',
        price: 39.99,
        category: 'Accessories',
        stock: 70,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Retro Round',
        description: 'Vintage-inspired round frame sunglasses.',
        price: 27.99,
        category: 'Accessories',
        stock: 55,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Wayfarer Classic',
        description: 'Timeless wayfarer style sunglasses with polarized lenses.',
        price: 32.99,
        category: 'Accessories',
        stock: 90,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Sunglasses - Clubmaster',
        description: 'Bold clubmaster frame with polarized lenses.',
        price: 36.99,
        category: 'Accessories',
        stock: 50,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Wrist Watch - Minimalist',
        description: 'Minimalist design quartz watch with leather strap.',
        price: 59.99,
        category: 'Fashion',
        stock: 25,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Designer Silk Scarf',
        description: '100% silk scarf with elegant geometric pattern.',
        price: 24.99,
        category: 'Fashion',
        stock: 35,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Leather Wallet RFID Blocking',
        description: 'Genuine leather bifold wallet with RFID protection.',
        price: 19.99,
        category: 'Accessories',
        stock: 100,
        featured: false,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Crossbody Bag',
        description: 'Stylish faux leather crossbody bag with adjustable strap.',
        price: 34.99,
        category: 'Fashion',
        stock: 45,
        featured: true,
        vendorId: fashionVendor.id,
      },
      {
        name: 'Canvas Tote Bag',
        description: 'Eco-friendly canvas tote with reinforced handles.',
        price: 19.99,
        category: 'Fashion',
        stock: 80,
        featured: false,
        vendorId: fashionVendor.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@storehub.com / admin123');
  console.log('Vendor 1: vendor1@storehub.com / vendor123');
  console.log('Vendor 2: vendor2@storehub.com / vendor123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
