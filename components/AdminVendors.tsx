'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Store, Check, X, Package } from 'lucide-react';

interface AdminVendorsProps {
  vendors: any[];
  currentStatus?: string;
}

export default function AdminVendors({ vendors, currentStatus }: AdminVendorsProps) {
  const [processingVendorId, setProcessingVendorId] = useState<string | null>(null);

  const handleApprove = async (vendorId: string) => {
    setProcessingVendorId(vendorId);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to approve vendor');
      }
    } catch (error) {
      alert('An error occurred');
    }
    setProcessingVendorId(null);
  };

  const handleReject = async (vendorId: string) => {
    if (!confirm('Are you sure you want to reject this vendor application?')) {
      return;
    }

    setProcessingVendorId(vendorId);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to reject vendor');
      }
    } catch (error) {
      alert('An error occurred');
    }
    setProcessingVendorId(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600">Approve and manage vendor accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/vendors"
            className={`px-4 py-2 rounded-lg border ${
              !currentStatus
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Vendors
          </Link>
          <Link
            href="/admin/vendors?status=pending"
            className={`px-4 py-2 rounded-lg border ${
              currentStatus === 'pending'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/vendors?status=approved"
            className={`px-4 py-2 rounded-lg border ${
              currentStatus === 'approved'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved
          </Link>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h2>
          <p className="text-gray-600">
            {currentStatus
              ? `No ${currentStatus} vendors`
              : 'No vendor applications yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Store className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                      <p className="text-sm text-gray-500">
                        {vendor.user.name} • {vendor.user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vendor.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {vendor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{vendor.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{vendor.products.length} products</span>
                  </div>
                  <div>
                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {!vendor.isApproved && (
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(vendor.id)}
                      disabled={processingVendorId === vendor.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(vendor.id)}
                      disabled={processingVendorId === vendor.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
