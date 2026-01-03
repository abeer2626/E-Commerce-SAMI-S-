import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminFeaturedSlots from '@/components/AdminFeaturedSlots';

export default async function AdminFeaturedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Get all featured slots with product and vendor info
  const featuredSlots = await prisma.featuredSlot.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
        },
      },
    },
    orderBy: [
      { position: 'asc' },
      { slotNumber: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Get revenue stats
  const paidSlots = await prisma.featuredSlot.findMany({
    where: { isPaid: true },
  });

  const totalRevenue = paidSlots.reduce((sum, slot) => sum + slot.price, 0);
  const activeRevenue = paidSlots
    .filter((slot) => slot.status === 'ACTIVE' && new Date(slot.endDate) >= new Date())
    .reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <AdminFeaturedSlots
        featuredSlots={featuredSlots}
        totalRevenue={totalRevenue}
        activeRevenue={activeRevenue}
      />
    </div>
  );
}
