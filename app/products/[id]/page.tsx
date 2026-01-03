'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Store, Heart, Share2, Truck, Shield, RotateCcw, ZoomIn, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import ProductReviews from '@/components/ProductReviews';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  useEffect(() => {
    if (product && session?.user) {
      fetchWishlistStatus();
    }
  }, [product, session]);

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

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }

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
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 aspect-square bg-gray-200 animate-pulse" />
              <div className="md:w-1/2 p-8 space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Back to Products
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  const images = product.image
    ? [product.image]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/products">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back to Products</span>
          </motion.button>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-6 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                {images[selectedImage] ? (
                  <>
                    <Image
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                    {isZoomed && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `url(${images[selectedImage]})`,
                          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                          backgroundSize: '200%',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <ZoomIn className="h-4 w-4 text-gray-700" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {images.map((image: string, index: number) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                        selectedImage === index
                          ? 'border-primary-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8 space-y-6">
              {/* Vendor Link */}
              <Link
                href={`/vendor/${product.vendorId}`}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <Store className="h-4 w-4 mr-2" />
                {product.vendor.businessName}
              </Link>

              {/* Product Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
              >
                {product.name}
              </motion.h1>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {avgRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              {/* Stock Status */}
              <div>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </span>
                {product.stock < 10 && product.stock > 0 && (
                  <p className="text-orange-600 text-sm mt-2 font-medium">
                    Only {product.stock} left - order soon!
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center font-bold hover:border-primary-600 hover:text-primary-600 transition"
                    >
                      -
                    </motion.button>
                    <span className="w-12 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center font-bold hover:border-primary-600 hover:text-primary-600 transition"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <AddToCartButton
                    productId={product.id}
                    stock={product.stock}
                    session={session}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-xl transition-all ${
                    isWishlisted
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  <Share2 className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Free Shipping</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Easy Returns</p>
                </div>
              </div>

              {/* Category */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition font-medium"
                >
                  {product.category}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews
          productId={product.id}
          reviews={product.reviews}
        />
      </main>
    </div>
  );
}
