'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FeaturedProduct {
  id: string;
  position: string;
  slotNumber: number;
  price: number;
  status: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    vendor: {
      businessName: string;
    };
  };
}

export default function FeaturedProducts() {
  const [heroSlots, setHeroSlots] = useState<FeaturedProduct[]>([]);
  const [gridSlots, setGridSlots] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/featured');
        if (response.ok) {
          const data = await response.json();

          // Separate by position
          const hero = data.slots.filter((s: FeaturedProduct) => s.position === 'HOMEPAGE_HERO');
          const grid = data.slots.filter((s: FeaturedProduct) => s.position === 'HOMEPAGE_GRID');

          setHeroSlots(hero);
          setGridSlots(grid);
        }
      } catch (error) {
        console.error('Failed to fetch featured:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (heroSlots.length === 0 && gridSlots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Hero Featured Slots */}
      {heroSlots.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-br-lg z-10 flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="font-semibold">Featured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroSlots.map((slot, index) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl overflow-hidden border-2 border-primary-200 shadow-lg"
              >
                <Link href={`/products/${slot.product.id}`} className="block">
                  <div className="relative h-56">
                    {slot.product.image ? (
                      <Image
                        src={slot.product.image}
                        alt={slot.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      ⭐ Featured
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{slot.product.vendor.businessName}</p>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                      {slot.product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600">
                        Rs. {(slot.product.price * 278).toFixed(0)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ${(slot.product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Featured Slots */}
      {gridSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gridSlots.map((slot, index) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <Link href={`/products/${slot.product.id}`} className="block">
                  <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <div className="relative h-48">
                      {slot.product.image ? (
                        <Image
                          src={slot.product.image}
                          alt={slot.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                        ⭐
                      </div>
                    </div>

                    <div className="p-3 bg-white">
                      <p className="text-xs text-gray-500 truncate">{slot.product.vendor.businessName}</p>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-primary-600 transition">
                        {slot.product.name}
                      </h3>
                      <p className="text-sm font-bold text-primary-600 mt-1">
                        Rs. {(slot.product.price * 278).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
