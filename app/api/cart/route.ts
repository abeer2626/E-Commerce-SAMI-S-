import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return NextResponse.json({ items: cartItems });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, quantity, productData } = await request.json();

  // Check if product exists in database
  let dbProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  // If product doesn't exist and productData is provided, create it (for demo products)
  if (!dbProduct && productData) {
    try {
      // For demo products, we need to find or create a vendor
      // Let's use the first admin vendor or create a default one
      let vendor = await prisma.vendor.findFirst({
        where: { isApproved: true },
      });

      if (!vendor) {
        // Create a default vendor for demo products
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (!adminUser) {
          return NextResponse.json({ error: 'No vendor available for demo products' }, { status: 400 });
        }

        vendor = await prisma.vendor.create({
          data: {
            userId: adminUser.id,
            businessName: 'StoreHub Demo',
            isApproved: true,
          },
        });
      }

      // Create the product in database
      dbProduct = await prisma.product.create({
        data: {
          id: productId,
          vendorId: vendor.id,
          name: productData.name,
          price: productData.price,
          category: productData.category || 'Accessories',
          image: productData.image,
          description: productData.description || `${productData.name} - Premium quality`,
          stock: productData.stock || 20,
          featured: false,
        },
      });
    } catch (error) {
      console.error('Failed to create demo product:', error);
      return NextResponse.json(
        { error: 'Failed to create demo product' },
        { status: 500 }
      );
    }
  }

  if (!dbProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Use transaction to prevent race conditions
  try {
    const cartItem = await prisma.$transaction(async (tx) => {
      // Check stock availability
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });

      const newQuantity = existingCartItem ? existingCartItem.quantity + quantity : quantity;

      if (dbProduct.stock < newQuantity) {
        throw new Error(
          `Insufficient stock. Available: ${dbProduct.stock}, Requested: ${newQuantity}`
        );
      }

      // Upsert cart item with proper isolation
      const item = await tx.cartItem.upsert({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
        update: { quantity: { increment: quantity } },
        create: {
          userId: session.user.id,
          productId,
          quantity,
        },
        include: { product: true },
      });

      return item;
    });

    return NextResponse.json({ item: cartItem });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Cart operation failed:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
