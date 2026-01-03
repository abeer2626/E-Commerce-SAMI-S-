'use client';

import { Heart, X, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface WishlistPageProps {
  wishlistItems: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      image: string | null;
      vendor: {
        businessName: string;
      };
    };
  }>;
}

export default function WishlistPage({ wishlistItems: initialItems }: WishlistPageProps) {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState(initialItems);
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());

  const total = wishlistItems.reduce(
    (sum, item) => (removedItems.has(item.id) ? 0 : sum) + item.product.price,
    0
  );

  const handleRemove = async (itemId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: itemId }),
      });

      if (response.ok) {
        setRemovedItems(new Set([...removedItems, itemId]));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const visibleItems = wishlistItems.filter((item) => !removedItems.has(item.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">
            {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        {visibleItems.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {!session?.user ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Sign in to view your wishlist</p>
          <a
            href="/auth/signin"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Sign In
          </a>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Save items you love by clicking the heart icon
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-square relative bg-gray-200">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-primary-600 mb-1">
                  {item.product.vendor.businessName}
                </p>
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  ${item.product.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    View Product
                  </Link>
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove from wishlist"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
