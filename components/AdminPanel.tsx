'use client';

import Link from 'next/link';
import { Users, Store, Package, ShoppingCart, Check, BarChart3, UserCircle, Wallet, Star } from 'lucide-react';
import { useState } from 'react';

interface AdminPanelProps {
  userCount: number;
  vendorCount: number;
  productCount: number;
  orderCount: number;
  pendingVendors: any[];
  recentOrders: any[];
}

export default function AdminPanel({
  userCount,
  vendorCount,
  productCount,
  orderCount,
  pendingVendors,
  recentOrders,
}: AdminPanelProps) {
  const [approvingVendor, setApprovingVendor] = useState<string | null>(null);

  const approveVendor = async (vendorId: string) => {
    setApprovingVendor(vendorId);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to approve vendor:', error);
    }
    setApprovingVendor(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Manage Users</p>
              <p className="text-sm text-gray-500">View and edit user roles</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/vendors"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Store className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">Manage Vendors</p>
              <p className="text-sm text-gray-500">Approve/reject vendors</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold">Manage Orders</p>
              <p className="text-sm text-gray-500">View all orders</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/payouts"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Vendor Payouts</p>
              <p className="text-sm text-gray-500">7-day hold • Manual payout</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/featured"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold">Featured</p>
              <p className="text-sm text-gray-500">2K-5K PKR/week</p>
            </div>
          </div>
        </Link>

        <Link
          href="/vendor/analytics"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold">Analytics</p>
              <p className="text-sm text-gray-500">View platform stats</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{userCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Vendors</p>
              <p className="text-3xl font-bold text-gray-900">{vendorCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Store className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <p className="text-3xl font-bold text-gray-900">{productCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-3xl font-bold text-gray-900">{orderCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Vendors */}
      {pendingVendors.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Pending Vendor Approvals ({pendingVendors.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingVendors.map((vendor: any) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 font-medium">
                      {vendor.businessName}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.user.name}
                      <br />
                      <span className="text-sm text-gray-500">
                        {vendor.user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {vendor.description}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => approveVendor(vendor.id)}
                        disabled={approvingVendor === vendor.id}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
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
              {recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono text-sm">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">{order.user.name}</td>
                  <td className="px-6 py-4">
                    {order.items.map((item: any) => item.product.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
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
