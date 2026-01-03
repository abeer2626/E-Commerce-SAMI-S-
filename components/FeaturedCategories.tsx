'use client';

import Link from 'next/link';
import { ShoppingBag, Laptop, Shirt, Home, Baby, Book, Glasses, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FeaturedCategoriesProps {
  categories: string[];
}

const categoryIcons: Record<string, any> = {
  Electronics: Laptop,
  Fashion: Shirt,
  Home: Home,
  Baby: Baby,
  Books: Book,
  Accessories: Glasses,
  default: ShoppingBag,
};

export default function FeaturedCategories({
  categories,
}: FeaturedCategoriesProps) {
  const displayCategories = categories.slice(0, 6);

  return (
    <>
      {/* Sunglasses Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '30px 30px',
            }} />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-white space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                <Glasses className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Featured Collection</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Premium Sunglasses
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  Collection 2024
                </span>
              </h2>

              <p className="text-gray-300 text-lg leading-relaxed">
                Discover our exclusive collection of designer sunglasses. UV protection meets style - perfect for every occasion.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">UV Protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-sm">Premium Quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">100% Authentic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0014 7z" />
                    </svg>
                  </div>
                  <span className="text-sm">Free Shipping</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/products?category=Accessories"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition-all group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
            </motion.div>

            {/* Right Content - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative flex items-center justify-center"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl" />

              {/* Image Container */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="relative w-72 h-72 md:w-96 md:h-96">
                  <Image
                    src="/001. Optical.jpg"
                    alt="Premium Sunglasses Collection"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-4 md:top-8 md:right-8 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full shadow-lg font-bold text-sm"
              >
                NEW ARRIVAL
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-8 left-4 md:left-8 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm border border-white/30"
              >
                Starting $49
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((category) => {
            const Icon = categoryIcons[category] || categoryIcons.default;
            return (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="group bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 mb-4 group-hover:bg-gradient-to-br group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white transition-all duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">{category}</h3>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
