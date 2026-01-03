import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { Suspense } from 'react';

function ProductsContent({
  category,
  search,
  sort,
  minPrice,
  maxPrice,
  inStock,
  products,
  categories,
  maxProductPrice,
}: {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  products: any[];
  categories: string[];
  maxProductPrice: number;
}) {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {search ? `Search: "${search}"` : category || 'All Products'}
        </h1>
        <p className="text-gray-600 mt-2">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {search
              ? `No products found matching "${search}"`
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              vendor={product.vendor}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const category = params.category;
  const search = params.search;
  const sort = params.sort || 'newest';
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const inStock = params.inStock;

  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) {
      where.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      where.price.lte = parseFloat(maxPrice);
    }
  }

  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  const getOrderBy = () => {
    switch (sort) {
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'price-low':
        return { price: 'asc' as const };
      case 'price-high':
        return { price: 'desc' as const };
      case 'name-asc':
        return { name: 'asc' as const };
      case 'name-desc':
        return { name: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  };

  const products = await prisma.product.findMany({
    where,
    include: { vendor: { include: { user: true } } },
    orderBy: getOrderBy(),
  });

  // Get unique categories
  const categoriesResult = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  const categories = categoriesResult.map((c) => c.category);

  // Get max price for the price range slider
  const maxPriceProduct = await prisma.product.findFirst({
    orderBy: { price: 'desc' },
    select: { price: true },
  });

  const maxProductPrice = maxPriceProduct?.price || 1000;
  const currentMinPrice = minPrice ? parseFloat(minPrice) : 0;
  const currentMaxPrice = maxPrice ? parseFloat(maxPrice) : maxProductPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <FilterSidebar
                categories={categories}
                currentCategory={category}
                minPrice={currentMinPrice}
                maxPrice={currentMaxPrice}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div>Loading...</div>}>
              <ProductsContent
                category={category}
                search={search}
                sort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStock={inStock}
                products={products}
                categories={categories}
                maxProductPrice={maxProductPrice}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
