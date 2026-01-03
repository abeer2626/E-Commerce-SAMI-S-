import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ProductForm from '@/components/ProductForm';

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'VENDOR') {
    redirect('/auth/signin');
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    redirect('/vendor/signup');
  }

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
        <ProductForm
          vendorId={vendor.id}
          categories={categories.map((c) => c.category)}
        />
      </main>
    </div>
  );
}
