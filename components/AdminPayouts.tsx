'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Wallet, Check, Clock, AlertCircle, RefreshCw, Calendar, User } from 'lucide-react';

interface AdminPayoutsProps {
  payouts: any[];
  stats: any;
  currentStatus?: string;
}

export default function AdminPayouts({ payouts, stats, currentStatus }: AdminPayoutsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleProcessPayout = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process' }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to process payout');
      }
    } catch (error) {
      alert('An error occurred');
    }
    setProcessingId(null);
  };

  const handleMarkPaid = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-paid' }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to mark as paid');
      }
    } catch (error) {
      alert('An error occurred');
    }
    setProcessingId(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilPayout = (createdAt: Date | string) => {
    const created = new Date(createdAt);
    const eligibleDate = new Date(created);
    eligibleDate.setDate(eligibleDate.getDate() + 7);
    const today = new Date();
    const diff = Math.ceil((eligibleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Payouts</h1>
        <p className="text-gray-600">Manage vendor payments and payouts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Payouts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Wallet className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid Total</p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {((stats.totalAmount._sum.amount || 0) * 278).toFixed(0)}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/payouts"
          className={`px-4 py-2 rounded-lg border ${
            !currentStatus
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Payouts
        </Link>
        <Link
          href="/admin/payouts?status=pending"
          className={`px-4 py-2 rounded-lg border ${
            currentStatus === 'pending'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending
        </Link>
        <Link
          href="/admin/payouts?status=processing"
          className={`px-4 py-2 rounded-lg border ${
            currentStatus === 'processing'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Processing
        </Link>
        <Link
          href="/admin/payouts?status=paid"
          className={`px-4 py-2 rounded-lg border ${
            currentStatus === 'paid'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Paid
        </Link>
      </div>

      {/* Payouts Table */}
      {payouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No payouts found</h2>
          <p className="text-gray-600">
            {currentStatus ? `No ${currentStatus} payouts` : 'No payouts yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Eligible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => {
                  const daysUntil = getDaysUntilPayout(payout.createdAt);
                  const isEligible = daysUntil <= 0;

                  return (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {payout.vendor.businessName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payout.vendor.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          Rs. {(payout.amount * 278).toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${payout.amount.toFixed(2)} USD
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            payout.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : payout.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : payout.status === 'PENDING' && isEligible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payout.status === 'PENDING' && !isEligible && (
                            <Clock className="h-4 w-4 mr-1" />
                          )}
                          {payout.status === 'PENDING' && isEligible && (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          {payout.status === 'PROCESSING' && (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          {payout.status === 'PAID' && (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          {payout.status === 'PENDING' && !isEligible
                            ? `${daysUntil} days left`
                            : payout.status === 'PENDING' && isEligible
                            ? 'Ready'
                            : payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(payout.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(
                            new Date(new Date(payout.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payout.status === 'PENDING' && isEligible && (
                          <button
                            onClick={() => handleProcessPayout(payout.id)}
                            disabled={processingId === payout.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                          >
                            {processingId === payout.id ? 'Processing...' : 'Process Payout'}
                          </button>
                        )}
                        {payout.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleMarkPaid(payout.id)}
                            disabled={processingId === payout.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                          >
                            {processingId === payout.id ? 'Updating...' : 'Mark as Paid'}
                          </button>
                        )}
                        {payout.status === 'PAID' && (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        )}
                        {!isEligible && payout.status === 'PENDING' && (
                          <span className="text-gray-400">Wait 7 days</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
