import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VendorDashboard from '@/components/VendorDashboard';

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'VENDOR') {
    redirect('/');
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
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
    redirect('/vendor/signup');
  }

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

  const totalRevenue = orders.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalSales = orders.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <VendorDashboard
        vendor={vendor}
        orders={orders}
        totalRevenue={totalRevenue}
        totalSales={totalSales}
      />
    </div>
  );
}
