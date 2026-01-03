'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  categories: string[];
  currentCategory?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function FilterSidebar({
  categories,
  currentCategory,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(currentCategory || '');
  const [priceRange, setPriceRange] = useState({ min: initialMinPrice || 0, max: initialMaxPrice || 1000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Calculate price range from all products (default 0-1000)
  const maxAvailablePrice = initialMaxPrice || 1000;

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    if (searchParams.get('sort')) params.set('sort', searchParams.get('sort')!);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < maxAvailablePrice) params.set('maxPrice', priceRange.max.toString());
    if (inStockOnly) params.set('inStock', 'true');
    router.push(`/products?${params.toString()}`);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    if (searchParams.get('sort')) params.set('sort', searchParams.get('sort')!);
    router.push(`/products?${params.toString()}`);
    setPriceRange({ min: 0, max: maxAvailablePrice });
    setSelectedCategory('');
    setInStockOnly(false);
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setPriceRange((prev) => ({ ...prev, min: Math.min(value, prev.max - 1) }));
    } else {
      setPriceRange((prev) => ({ ...prev, max: Math.max(value, prev.min + 1) }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Categories Filter */}
      <div className="border-b pb-4">
        <motion.button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Categories</h3>
          {expandedSections.categories ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </motion.button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCategory}
                    onChange={() => {
                      setSelectedCategory('');
                      updateFilters();
                    }}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-700 group-hover:text-primary-600 transition">All Categories</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {categories.length}
                  </span>
                </label>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => {
                        setSelectedCategory(cat);
                        updateFilters();
                      }}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-gray-700 group-hover:text-primary-600 transition">{cat}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Filter */}
      <div className="border-b pb-4">
        <motion.button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </motion.button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {/* Price Range Slider */}
                <div className="px-2">
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    {/* Progress bar */}
                    <div
                      className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                      style={{
                        left: `${(priceRange.min / maxAvailablePrice) * 100}%`,
                        right: `${100 - (priceRange.max / maxAvailablePrice) * 100}%`,
                      }}
                    />
                    {/* Min slider */}
                    <input
                      type="range"
                      min="0"
                      max={maxAvailablePrice}
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', parseFloat(e.target.value))}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                      style={{ zIndex: 10 }}
                    />
                    {/* Max slider */}
                    <input
                      type="range"
                      min="0"
                      max={maxAvailablePrice}
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', parseFloat(e.target.value))}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                      style={{ zIndex: 10 }}
                    />
                    {/* Min thumb */}
                    <div
                      className="absolute w-5 h-5 bg-white border-2 border-primary-600 rounded-full shadow-lg cursor-pointer hover:scale-110 transition"
                      style={{
                        left: `${(priceRange.min / maxAvailablePrice) * 100}%`,
                        transform: 'translateX(-50%)',
                        top: '50%',
                        marginTop: '-10px',
                        zIndex: 20,
                      }}
                    />
                    {/* Max thumb */}
                    <div
                      className="absolute w-5 h-5 bg-white border-2 border-primary-600 rounded-full shadow-lg cursor-pointer hover:scale-110 transition"
                      style={{
                        left: `${(priceRange.max / maxAvailablePrice) * 100}%`,
                        transform: 'translateX(-50%)',
                        top: '50%',
                        marginTop: '-10px',
                        zIndex: 20,
                      }}
                    />
                  </div>
                </div>

                {/* Price Inputs */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        max={priceRange.max - 1}
                        value={priceRange.min}
                        onChange={(e) => handlePriceRangeChange('min', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min={priceRange.min + 1}
                        max={maxAvailablePrice}
                        value={priceRange.max}
                        onChange={(e) => handlePriceRangeChange('max', parseFloat(e.target.value) || maxAvailablePrice)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={updateFilters}
                  className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition font-medium text-sm"
                >
                  Apply Price Filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Availability Filter */}
      <div className="border-b pb-4">
        <motion.button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900">Availability</h3>
          {expandedSections.availability ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </motion.button>
        <AnimatePresence>
          {expandedSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateFilters();
                    }}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 group-hover:text-primary-600 transition">In Stock Only</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || priceRange.min > 0 || priceRange.max < maxAvailablePrice || inStockOnly) && (
        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Category: {selectedCategory}
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    updateFilters();
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {priceRange.min > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Min: ${priceRange.min}
                <button
                  onClick={() => {
                    setPriceRange((prev) => ({ ...prev, min: 0 }));
                    updateFilters();
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {priceRange.max < maxAvailablePrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                Max: ${priceRange.max}
                <button
                  onClick={() => {
                    setPriceRange((prev) => ({ ...prev, max: maxAvailablePrice }));
                    updateFilters();
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                In Stock
                <button
                  onClick={() => {
                    setInStockOnly(false);
                    updateFilters();
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
