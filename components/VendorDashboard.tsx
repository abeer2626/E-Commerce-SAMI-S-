'use client';

import Link from 'next/link';
import { Package, DollarSign, TrendingUp, Plus, Edit, Trash2, ShoppingCart, BarChart3, MessageCircle, Clock, CheckCircle, Award, Star } from 'lucide-react';
import { useState } from 'react';
import VendorTrustBadges from './VendorTrustBadges';

interface VendorDashboardProps {
  vendor: any;
  orders: any[];
  totalRevenue: number;
  totalSales: number;
}

export default function VendorDashboard({
  vendor,
  orders,
  totalRevenue,
  totalSales,
}: VendorDashboardProps) {
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeletingProductId(productId);
    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('An error occurred');
    }
    setDeletingProductId(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {vendor.businessName}
          </h1>
          <p className="text-gray-600">{vendor.description}</p>
          {!vendor.isApproved && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Pending Approval
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* WhatsApp Support Button */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <MessageCircle className="h-5 w-5" />
            <span>WhatsApp Support</span>
          </a>
          <Link
            href="/vendor/featured"
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-orange-600 transition shadow-md"
          >
            <Star className="h-5 w-5" />
            <span>Book Featured</span>
          </Link>
          <Link
            href="/vendor/analytics"
            className="flex items-center space-x-2 border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
          <Link
            href="/vendor/orders"
            className="flex items-center space-x-2 border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/vendor/products/new"
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">
                {vendor.products.length}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                Rs. {(totalRevenue * 278).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400">${totalRevenue.toFixed(2)} USD</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900">{totalSales}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Payout Status */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 text-sm font-medium">Pending Payout</p>
            <Clock className="h-5 w-5 text-orange-200" />
          </div>
          <p className="text-3xl font-bold">Rs. {((totalRevenue * 0.9) * 278).toFixed(0)}</p>
          <p className="text-xs text-orange-200 mt-1">After 10% commission • 7-day hold</p>
        </div>
      </div>

      {/* Two Column Layout - Products & Trust Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Products Table - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendor.products.map((product: any) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product._count.orderItems}
                  </td>
                  <td className="px-6 py-4">{product._count.reviews}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/vendor/products/${product.id}/edit`}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingProductId === product.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* Trust Badges Sidebar */}
        <div className="lg:col-span-1">
          <VendorTrustBadges
            badges={vendor.badges}
            trustScore={vendor.trustScore || 0}
            paidOnTimeStreak={vendor.paidOnTimeStreak || 0}
            totalOrders={vendor.totalOrders || 0}
            successfulDeliveries={vendor.successfulDeliveries || 0}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link
            href="/vendor/orders"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((orderItem: any) => (
                <tr key={orderItem.id}>
                  <td className="px-6 py-4 font-mono text-sm">
                    {orderItem.order.orderNumber}
                  </td>
                  <td className="px-6 py-4">{orderItem.product.name}</td>
                  <td className="px-6 py-4">{orderItem.order.user.name}</td>
                  <td className="px-6 py-4">{orderItem.quantity}</td>
                  <td className="px-6 py-4">
                    ${(orderItem.price * orderItem.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        orderItem.order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : orderItem.order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {orderItem.order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
