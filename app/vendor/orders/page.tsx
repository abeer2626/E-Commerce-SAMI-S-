import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VendorOrders from '@/components/VendorOrders';

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'VENDOR') {
    redirect('/');
  }

  const params = await searchParams;
  const statusFilter = params.status;

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    redirect('/vendor/signup');
  }

  const where: any = {
    product: { vendorId: vendor.id },
  };

  if (statusFilter) {
    where.order = { status: statusFilter };
  }

  const orderItems = await prisma.orderItem.findMany({
    where,
    include: {
      order: {
        include: {
          user: true,
        },
      },
      product: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
  });

  // Group order items by order
  const groupedOrders = orderItems.reduce((acc: any, item: any) => {
    const orderId = item.order.id;
    if (!acc[orderId]) {
      acc[orderId] = {
        ...item.order,
        items: [],
      };
    }
    acc[orderId].items.push(item);
    return acc;
  }, {});

  const orders = Object.values(groupedOrders);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <VendorOrders orders={orders} currentStatus={statusFilter} />
    </div>
  );
}
