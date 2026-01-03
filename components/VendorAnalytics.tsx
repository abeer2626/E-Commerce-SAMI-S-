'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';

interface VendorAnalyticsProps {
  dailyRevenue: Record<string, number>;
  dailyOrders: Record<string, number>;
  topProducts: Array<{ name: string; revenue: number; quantity: number; productId: string }>;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  avgOrderValue: number;
  revenueChange: number;
  period: string;
}

export default function VendorAnalytics({
  dailyRevenue,
  dailyOrders,
  topProducts,
  statusCounts,
  totalRevenue,
  totalOrders,
  totalItemsSold,
  avgOrderValue,
  revenueChange,
  period,
}: VendorAnalyticsProps) {
  const dates = Object.keys(dailyRevenue).sort();
  const revenueValues = dates.map((d) => dailyRevenue[d]);
  const maxRevenue = Math.max(...revenueValues, 1);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-400',
    PROCESSING: 'bg-blue-400',
    SHIPPED: 'bg-purple-400',
    DELIVERED: 'bg-green-400',
    CANCELLED: 'bg-red-400',
  };

  const totalStatusCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/vendor/analytics?period=7"
            className={`px-4 py-2 rounded-lg border ${
              period === '7'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            7 Days
          </Link>
          <Link
            href="/vendor/analytics?period=30"
            className={`px-4 py-2 rounded-lg border ${
              period === '30'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 Days
          </Link>
          <Link
            href="/vendor/analytics?period=90"
            className={`px-4 py-2 rounded-lg border ${
              period === '90'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            90 Days
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
          <div className={`flex items-center text-sm mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueChange >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(revenueChange).toFixed(1)}% vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Orders in this period</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Items Sold</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalItemsSold}</p>
          <p className="text-sm text-gray-500 mt-1">Total items sold</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Avg Order Value</p>
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${avgOrderValue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Per order average</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Revenue Over Time</h2>
        <div className="h-64">
          {dates.length > 0 && revenueValues.some((v) => v > 0) ? (
            <div className="flex items-end justify-between h-full gap-1">
              {dates.map((date, i) => {
                const value = dailyRevenue[date];
                const height = maxRevenue > 0 ? (value / maxRevenue) * 100 : 0;
                const dateObj = new Date(date);
                const displayDate =
                  period === '7'
                    ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                    : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary-500 hover:bg-primary-600 rounded-t transition relative group"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        ${value.toFixed(2)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 rotate-0 sm:rotate-0 truncate w-full text-center">
                      {displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No revenue data for this period
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const maxProductRevenue = topProducts[0].revenue;
                const barWidth = maxProductRevenue > 0 ? (product.revenue / maxProductRevenue) * 100 : 0;

                return (
                  <div key={product.productId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-semibold">
                          {index + 1}
                        </span>
                        <Link
                          href={`/products/${product.productId}`}
                          className="font-medium text-gray-900 hover:text-primary-600 truncate max-w-[200px]"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{product.quantity} sold</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          {totalStatusCount === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const percentage = totalStatusCount > 0 ? (count / totalStatusCount) * 100 : 0;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
                          <span className="font-medium capitalize">{status.toLowerCase()}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{count}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition ${statusColors[status] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Daily Orders</h2>
        <div className="h-48">
          {dates.length > 0 && Object.values(dailyOrders).some((v) => v > 0) ? (
            <div className="flex items-end justify-between h-full gap-1">
              {dates.map((date) => {
                const value = dailyOrders[date];
                const maxOrders = Math.max(...Object.values(dailyOrders), 1);
                const height = (value / maxOrders) * 100;
                const dateObj = new Date(date);
                const displayDate =
                  period === '7'
                    ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                    : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition relative group"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded">
                        {value} orders
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 truncate w-full text-center">
                      {displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No order data for this period
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
