import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import FeaturedCategories from '@/components/FeaturedCategories';
import SunglassesSection from '@/components/SunglassesSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustSignals from '@/components/TrustSignals';
import Footer from '@/components/Footer';
import { homePageMetadata } from '@/lib/metadata';

export { metadata } from '@/lib/metadata';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    include: { vendor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <Hero />

      {/* Trust Signals - Real Data */}
      <TrustSignals />

      {/* Featured Products - Paid slots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeaturedProducts />
      </div>

      <FeaturedCategories categories={categories.map((c) => c.category)} />

      {/* Sunglasses Special Section */}
      <SunglassesSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              vendor={product.vendor}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
