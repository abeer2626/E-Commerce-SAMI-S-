import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import AdminVendors from '@/components/AdminVendors';

export default async function AdminVendorsPage({
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

  const where = statusFilter === 'pending' ? { isApproved: false } : statusFilter === 'approved' ? { isApproved: true } : {};

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      user: true,
      products: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <AdminVendors vendors={vendors} currentStatus={statusFilter} />
    </div>
  );
}
