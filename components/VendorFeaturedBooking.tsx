'use client';

import { useState } from 'react';
import { Star, Calendar, CreditCard, Check, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  image: string | null;
  price: number;
  stock: number;
}

interface FeaturedSlot {
  id: string;
  position: string;
  slotNumber: number;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  isPaid: boolean;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
  };
}

interface VendorFeaturedBookingProps {
  products: Product[];
  featuredSlots: FeaturedSlot[];
  vendorId: string;
}

export default function VendorFeaturedBooking({
  products,
  featuredSlots,
  vendorId,
}: VendorFeaturedBookingProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const positions = [
    { id: 'HOMEPAGE_HERO', name: 'Homepage Hero', price: 5000, description: 'Top carousel on homepage', slots: 3 },
    { id: 'HOMEPAGE_GRID', name: 'Homepage Grid', price: 3000, description: 'Featured grid on homepage', slots: 4 },
    { id: 'CATEGORY_TOP', name: 'Category Top', price: 2000, description: 'Top of category pages', slots: 3 },
    { id: 'CATEGORY_SIDEBAR', name: 'Category Sidebar', price: 2000, description: 'Sidebar on category pages', slots: 2 },
  ];

  const selectedPositionData = positions.find((p) => p.id === selectedPosition);
  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const totalPrice = selectedPositionData
    ? selectedPositionData.price * duration
    : 0;

  const handleBookSlot = async () => {
    if (!selectedProduct || !selectedPosition || selectedSlot === null || !startDate) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setBooking(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          position: selectedPosition,
          slotNumber: selectedSlot,
          startDate,
          duration,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Featured slot booked successfully! Total: Rs. ${totalPrice.toLocaleString()}. Please wait for admin approval.`,
        });
        // Reset form
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Booking failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setBooking(false);
    }
  };

  const getSlotStatus = (position: string, slotNumber: number) => {
    const now = new Date();
    const slot = featuredSlots.find(
      (s) => s.position === position && s.slotNumber === slotNumber && s.status === 'ACTIVE'
    );

    if (!slot) return 'available';
    if (new Date(slot.endDate) < now) return 'available';
    if (slot.isPaid) return 'booked';
    return 'pending';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (slot: FeaturedSlot) => {
    const isExpired = new Date(slot.endDate) < new Date();

    if (isExpired || slot.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {isExpired ? 'Expired' : 'Cancelled'}
        </span>
      );
    }

    if (!slot.isPaid) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Payment
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Check className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  // Set default start date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStartDate = tomorrow.toISOString().split('T')[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
        <p className="text-gray-600">Boost your sales with featured placement</p>
      </div>

      {/* Pricing Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8 border border-purple-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-purple-600" />
          Pricing (PKR per week)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {positions.map((pos) => (
            <div key={pos.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="font-bold text-purple-700 text-lg">Rs. {pos.price.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{pos.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Book Featured Slot
            </h2>

            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id} disabled={product.stock === 0}>
                    {product.name} {product.stock === 0 && '(Out of Stock)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Position *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {positions.map((pos) => {
                  const statusCounts = Array.from({ length: pos.slots }, (_, i) => i + 1).map(
                    (slotNum) => getSlotStatus(pos.id, slotNum)
                  );
                  const availableCount = statusCounts.filter((s) => s === 'available').length;

                  return (
                    <button
                      key={pos.id}
                      onClick={() => {
                        setSelectedPosition(pos.id);
                        if (selectedSlot === null || selectedSlot > pos.slots) {
                          setSelectedSlot(1);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedPosition === pos.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{pos.name}</div>
                      <div className="text-sm text-gray-500">{pos.description}</div>
                      <div className="text-sm mt-2">
                        <span className="font-bold text-primary-600">Rs. {pos.price.toLocaleString()}</span>
                        <span className="text-gray-400">/week</span>
                      </div>
                      <div className={`text-xs mt-1 ${
                        availableCount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {availableCount > 0
                          ? `${availableCount} slots available`
                          : 'Fully booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot Selection */}
            {selectedPositionData && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Slot Number *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {Array.from({ length: selectedPositionData.slots }, (_, i) => i + 1).map((slotNum) => {
                    const status = getSlotStatus(selectedPosition!, slotNum);
                    return (
                      <button
                        key={slotNum}
                        onClick={() => status === 'available' && setSelectedSlot(slotNum)}
                        disabled={status !== 'available'}
                        className={`w-16 h-16 rounded-lg border-2 font-bold transition ${
                          selectedSlot === slotNum
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : status === 'available'
                            ? 'border-gray-300 hover:border-primary-400 bg-white'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slotNum}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-xs mt-2">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                    Available
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    Booked
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    Pending
                  </span>
                </div>
              </div>
            )}

            {/* Start Date & Duration */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate || defaultStartDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={defaultStartDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks) *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>1 week</option>
                  <option value={2}>2 weeks</option>
                  <option value={3}>3 weeks</option>
                  <option value={4}>4 weeks</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            {selectedPositionData && selectedSlot !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 mb-6"
              >
                <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{selectedPositionData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slot Number:</span>
                    <span className="font-medium">#{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} week{duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per week:</span>
                    <span className="font-medium">Rs. {selectedPositionData.price.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-xl text-primary-600">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookSlot}
              disabled={
                booking ||
                !selectedProduct ||
                !selectedPosition ||
                selectedSlot === null ||
                !startDate
              }
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {booking ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Book Now - Rs. {totalPrice.toLocaleString()}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              * Admin will review and approve your booking. You&apos;ll receive payment instructions via WhatsApp.
            </p>
          </div>
        </div>

        {/* My Bookings */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Featured Slots</h2>

            {featuredSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No featured slots booked yet</p>
                <p className="text-sm mt-1">Book your first featured slot to boost sales!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {slot.position.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-500">Slot #{slot.slotNumber}</div>
                      </div>
                      {getStatusBadge(slot)}
                    </div>

                    <div className="text-sm mb-2">{slot.product.name}</div>

                    <div className="text-sm text-gray-600 mb-2">
                      <div>Rs. {slot.price.toLocaleString()}</div>
                      <div className="text-xs">
                        {formatDate(slot.startDate)} - {formatDate(slot.endDate)}
                      </div>
                    </div>

                    {!slot.isPaid && slot.status === 'ACTIVE' && (
                      <div className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded">
                        Awaiting payment approval
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">How it works</p>
                  <ul className="space-y-1 text-xs">
                    <li>1. Choose your product and position</li>
                    <li>2. Select available slot and duration</li>
                    <li>3. Submit booking request</li>
                    <li>4. Admin reviews and sends payment info</li>
                    <li>5. Pay via Easypaisa/Jazzcash/Bank</li>
                    <li>6. Your product goes live!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
