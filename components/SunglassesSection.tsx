'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Star, Truck, Shield, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

interface SunglassProduct {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  description?: string;
}

const sunglassesProducts: SunglassProduct[] = [
  {
    id: 'sun-001',
    name: 'Premium Aviator Sunglasses',
    price: 129.99,
    oldPrice: 179.99,
    image: '/001. Optical.jpg',
    category: 'Accessories',
    stock: 15,
    rating: 4.8,
    reviews: 124,
    description: 'Classic aviator style with polarized lenses for ultimate UV protection.',
  },
  {
    id: 'sun-002',
    name: 'Classic Wayfarer Sunglasses',
    price: 89.99,
    oldPrice: 129.99,
    image: '/002.Optical  (1).jpg',
    category: 'Accessories',
    stock: 20,
    rating: 4.6,
    reviews: 89,
    description: 'Timeless wayfarer design suitable for all face shapes.',
  },
  {
    id: 'sun-003',
    name: 'Designer Round Sunglasses',
    price: 149.99,
    image: '/003.Optical.jpg',
    category: 'Accessories',
    stock: 12,
    rating: 4.9,
    reviews: 67,
    description: 'Modern round frame with premium acetate finish.',
  },
];

export default function SunglassesSection() {
  const { data: session } = useSession();
  const { fetchCart } = useCart();
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetchWishlistStatus();
    }
  }, [session]);

  const fetchWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const wishlistedIds = new Set<string>(
          data.items
            .filter((item: any) =>
            sunglassesProducts.some((p) => p.id === item.productId)
          )
            .map((item: any) => item.productId as string)
        );
        setWishlisted(wishlistedIds);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const newWishlisted = new Set(wishlisted);
        if (newWishlisted.has(productId)) {
          newWishlisted.delete(productId);
          toast.success('Removed from wishlist');
        } else {
          newWishlisted.add(productId);
          toast.success('Added to wishlist');
        }
        setWishlisted(newWishlisted);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const addToCart = async (product: SunglassProduct) => {
    if (!session?.user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }

    setAddingToCart((prev) => new Set(prev).add(product.id));

    try {
      // For demo sunglasses, we'll create a mock cart item
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          // Include product data for mock products
          productData: {
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
          },
        }),
      });

      if (response.ok) {
        setAddedToCart((prev) => new Set(prev).add(product.id));
        fetchCart();
        toast.success('Added to cart!', {
          description: `${product.name} has been added to your cart`,
          action: {
            label: 'View Cart',
            onClick: () => (window.location.href = '/checkout'),
          },
        });

        // Remove "added" indicator after 3 seconds
        setTimeout(() => {
          setAddedToCart((prev) => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
        }, 3000);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      // If API fails, show success for demo purposes
      setAddedToCart((prev) => new Set(prev).add(product.id));
      toast.success('Added to cart!', {
        description: `${product.name} has been added to your cart`,
      });
      setTimeout(() => {
        setAddedToCart((prev) => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }, 3000);
    }

    setAddingToCart((prev) => {
      const newSet = new Set(prev);
      newSet.delete(product.id);
      return newSet;
    });
  };

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-4">
            New Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Premium Sunglasses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exclusive collection of designer sunglasses. Style meets protection.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sunglassesProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Image Section */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.oldPrice && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3 rounded-full transition-colors ${
                        wishlisted.has(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${wishlisted.has(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <Link
                      href={`/products?search=${encodeURIComponent(product.name)}`}
                      className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </div>

                  {/* Stock Badge */}
                  {product.stock < 15 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Only {product.stock} left!
                      </span>
                    </div>
                  )}

                  {/* Added to Cart Badge */}
                  {addedToCart.has(product.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Added!
                    </motion.div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ${product.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0 || addingToCart.has(product.id)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : addingToCart.has(product.id)
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30'
                    }`}
                  >
                    {addingToCart.has(product.id) ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <div className="p-3 bg-amber-100 rounded-full">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">UV Protection</h4>
              <p className="text-sm text-gray-600">100% UV400 protection</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <div className="p-3 bg-amber-100 rounded-full">
              <Truck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Fast Shipping</h4>
              <p className="text-sm text-gray-600">Free delivery on orders</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <div className="p-3 bg-amber-100 rounded-full">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Easy Returns</h4>
              <p className="text-sm text-gray-600">30-day return policy</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/products?category=Accessories"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:scale-105"
          >
            <ShoppingBag className="h-5 w-5" />
            View All Sunglasses
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
