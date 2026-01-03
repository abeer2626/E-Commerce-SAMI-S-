import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VendorFeaturedBooking from '@/components/VendorFeaturedBooking';

export default async function VendorFeaturedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'VENDOR') {
    redirect('/');
  }

  // Get vendor
  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    redirect('/vendor/signup');
  }

  // Get vendor's products
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      stock: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get vendor's existing featured slots
  const featuredSlots = await prisma.featuredSlot.findMany({
    where: { vendorId: vendor.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Date objects to ISO strings for client component
  const serializedSlots = featuredSlots.map((slot) => ({
    ...slot,
    startDate: slot.startDate.toISOString(),
    endDate: slot.endDate.toISOString(),
    createdAt: slot.createdAt.toISOString(),
    updatedAt: slot.updatedAt.toISOString(),
    paidAt: slot.paidAt?.toISOString() || null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <VendorFeaturedBooking
        products={products}
        featuredSlots={serializedSlots}
        vendorId={vendor.id}
      />
    </div>
  );
}
