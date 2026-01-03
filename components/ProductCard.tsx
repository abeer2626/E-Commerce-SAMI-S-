'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: any;
  vendor: any;
}

export default function ProductCard({ product, vendor }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Parse vendor badges
  const vendorBadges = vendor?.badges ? JSON.parse(vendor.badges) : [];
  const trustScore = vendor?.trustScore || 0;

  useEffect(() => {
    if (session?.user) {
      fetchWishlistStatus();
    }
  }, [session, product.id]);

  const fetchWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const isInWishlist = data.items.some(
          (item: any) => item.product.id === product.id
        );
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist status', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.action === 'added');
        toast.success(data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
    setIsLoading(false);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200">
          {/* Image Container */}
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {product.image && !imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-300" />
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg"
                >
                  <Eye className="h-5 w-5 text-primary-600" />
                </motion.div>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  Featured
                </span>
              )}
              {discount > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  Low Stock
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              disabled={isLoading}
              className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''} ${
                  isLoading ? 'animate-pulse' : ''
                }`}
              />
            </motion.button>

            {/* Stock Status Overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-white px-4 py-2 rounded-full font-bold text-gray-900 shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Vendor with Trust Badge */}
            <div className="flex items-center justify-between">
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/vendor/${product.vendorId}`);
                }}
                className="block cursor-pointer"
              >
                <p className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  {vendor.businessName}
                </p>
              </span>
              {/* Trust Badge */}
              {trustScore >= 80 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-300">
                  <span className="text-xs font-bold text-yellow-700">⭐ Trusted</span>
                </span>
              )}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < 4
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">(4.0)</span>
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.stock > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {product.stock > 0 ? 'In Stock' : 'Sold Out'}
              </span>
            </div>

            {/* Quick Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ y: 0 }}
              className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <AddToCartButton
                productId={product.id}
                stock={product.stock}
                session={session}
                compact
              />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
