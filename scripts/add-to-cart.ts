import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get customer user
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@example.com' },
  });

  if (!customer) {
    console.log('Customer not found. Please run seed first.');
    return;
  }

  // Clear existing cart
  await prisma.cartItem.deleteMany({
    where: { userId: customer.id },
  });

  // Get some products
  const products = await prisma.product.findMany({
    take: 3,
    where: { stock: { gt: 0 } },
  });

  if (products.length === 0) {
    console.log('No products found. Please run seed first.');
    return;
  }

  // Add products to cart
  for (const product of products) {
    await prisma.cartItem.create({
      data: {
        userId: customer.id,
        productId: product.id,
        quantity: 1,
      },
    });
    console.log(`✓ Added to cart: ${product.name} - $${product.price}`);
  }

  console.log('\n✅ Cart updated! Go to http://localhost:3000/checkout');
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
