import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminPayouts from '@/components/AdminPayouts';

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const statusFilter = params.status;

  const where = statusFilter ? { status: statusFilter.toUpperCase() } : {};

  const payouts = await prisma.payout.findMany({
    where,
    include: {
      vendor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  const stats = {
    total: await prisma.payout.count(),
    pending: await prisma.payout.count({ where: { status: 'PENDING' } }),
    processing: await prisma.payout.count({ where: { status: 'PROCESSING' } }),
    paid: await prisma.payout.count({ where: { status: 'PAID' } }),
    totalAmount: await prisma.payout.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <AdminPayouts payouts={payouts} stats={stats} currentStatus={statusFilter} />
    </div>
  );
}
