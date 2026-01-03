'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Package,
  User,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    vendor: {
      id: string;
      businessName: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  payment?: {
    id: string;
    status: string;
    amount: number;
  };
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
      });

      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotalOrders(data.pagination.total);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(orders.map((o) => (o.id === selectedOrder.id ? data.order : o)));
        setShowStatusDialog(false);
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">
              Manage and track all orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="hover:bg-gray-50">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{order.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{order.items.length} items</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setShowStatusDialog(true);
                        }}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        Update Status
                      </button>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedOrder === order.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expandedOrder === order.id && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                      <div className="py-4 space-y-4">
                        {/* Customer Info */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer</h4>
                          <p className="text-sm text-gray-600">{order.user.name}</p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.street}<br/>
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        )}

                        {/* Order Items */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="font-medium text-gray-900">{item.product.name}</div>
                                  <div className="text-gray-500">x{item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-gray-500 text-xs">by {item.product.vendor.businessName}</span>
                                  <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Info */}
                        {order.payment && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment</h4>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`px-2 py-0.5 rounded text-xs ${statusColors[order.payment.status] || 'bg-gray-100 text-gray-700'}`}>{order.payment.status}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * limit) + 1} to{' '}
                  {Math.min(currentPage * limit, totalOrders)} of {totalOrders} orders
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!hasMore}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Dialog */}
      {showStatusDialog && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Order Status
            </h3>
            <p className="text-gray-600 mb-4">
              Order: <strong>{selectedOrder.orderNumber}</strong>
            </p>
            <div className="space-y-2 mb-6">
              {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={actionLoading || status === selectedOrder.status}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    status === selectedOrder.status
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  } ${
                    actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${statusColors[status].split(' ')[1]}`} />
                  <span className="font-medium">{status}</span>
                  {status === selectedOrder.status && (
                    <span className="ml-auto text-xs text-primary-600">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowStatusDialog(false);
                setSelectedOrder(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
