'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Calendar, Wallet, Plus, CheckCircle, Clock, XCircle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminFeaturedSlotsProps {
  featuredSlots: any[];
  totalRevenue: number;
  activeRevenue: number;
}

export default function AdminFeaturedSlots({
  featuredSlots,
  totalRevenue,
  activeRevenue,
}: AdminFeaturedSlotsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredSlots = featuredSlots.filter((slot) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return slot.status === 'ACTIVE' && new Date(slot.endDate) >= new Date();
    }
    if (filter === 'expired') {
      return slot.status === 'EXPIRED' || new Date(slot.endDate) < new Date();
    }
    return true;
  });

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      HOMEPAGE_HERO: 'Homepage Hero',
      HOMEPAGE_GRID: 'Homepage Grid',
      CATEGORY_TOP: 'Category Top',
      CATEGORY_SIDEBAR: 'Category Sidebar',
    };
    return labels[position] || position;
  };

  const getPositionPrice = (position: string) => {
    const prices: Record<string, number> = {
      HOMEPAGE_HERO: 5000,
      HOMEPAGE_GRID: 3000,
      CATEGORY_TOP: 2000,
      CATEGORY_SIDEBAR: 2000,
    };
    return prices[position] || 2000;
  };

  const getStatusBadge = (slot: any) => {
    const isExpired = new Date(slot.endDate) < new Date();

    if (slot.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </span>
      );
    }

    if (!slot.isPaid) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Payment
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
            <p className="text-gray-600">Manage paid product promotions</p>
          </div>
          <Link
            href="/admin/featured/new"
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Featured Slot</span>
          </Link>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">Rs. {totalRevenue.toFixed(0)}</p>
            </div>
            <Wallet className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Revenue</p>
              <p className="text-3xl font-bold">Rs. {activeRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Slots</p>
              <p className="text-3xl font-bold">
                {featuredSlots.filter(
                  (s) => s.status === 'ACTIVE' && new Date(s.endDate) >= new Date()
                ).length}
              </p>
            </div>
            <Star className="h-10 w-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💰 Featured Slot Pricing (PKR/week)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Homepage Hero:</span>
            <span className="text-blue-700 ml-2">Rs. 5,000</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Homepage Grid:</span>
            <span className="text-blue-700 ml-2">Rs. 3,000</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Category Top:</span>
            <span className="text-blue-700 ml-2">Rs. 2,000</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Category Sidebar:</span>
            <span className="text-blue-700 ml-2">Rs. 2,000</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All ({featuredSlots.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'expired'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Expired
        </button>
      </div>

      {/* Slots Grid */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No featured slots found</h2>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Get started by adding featured products'
              : `No ${filter} featured slots`}
          </p>
          {filter === 'all' && (
            <Link
              href="/admin/featured/new"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Featured Slot</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {slot.product.image ? (
                  <img
                    src={slot.product.image}
                    alt={slot.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-semibold text-gray-700">
                    Slot #{slot.slotNumber}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {getPositionLabel(slot.position)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {slot.product.name}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                  by {slot.vendor.businessName}
                </p>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-bold text-green-600">
                    Rs. {slot.price.toFixed(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Duration:
                  </span>
                  <span className="text-gray-700">
                    {formatDate(slot.startDate)} - {formatDate(slot.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  {getStatusBadge(slot)}
                  <span className="text-sm font-medium text-gray-700">
                    ${(slot.product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
