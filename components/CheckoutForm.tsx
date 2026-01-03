'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Shield, Lock, DollarSign, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFormProps {
  cartItems: any[];
  total: number;
  categories?: string[];
}

type PaymentMethod = 'COD' | 'ADVANCE' | 'ONLINE';

interface PaymentMethodsResult {
  allowedMethods: PaymentMethod[];
  restrictedMethods: PaymentMethod[];
  advancePaymentMethods: PaymentMethod[];
  methods: {
    COD: { status: string; advancePaymentRequirement?: any };
    ADVANCE: { status: string; advancePaymentRequirement?: any };
    ONLINE: { status: string; advancePaymentRequirement?: any };
  };
}

export default function CheckoutForm({ cartItems, total, categories = [] }: CheckoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodsResult | null>(null);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  useEffect(() => {
    fetchAvailablePaymentMethods();
  }, []);

  const fetchAvailablePaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const params = new URLSearchParams({
        orderTotal: total.toString(),
        ...(categories.length > 0 && { categories: categories.join(',') }),
      });

      const response = await fetch(`/api/checkout/payment-methods?${params}`);
      if (response.ok) {
        const data = await response.json();
        // The API returns { context, evaluation } structure
        setAvailableMethods(data.evaluation);

        // Auto-select first available method if current selection is restricted
        if (data.evaluation?.allowedMethods?.length > 0 && !data.evaluation.allowedMethods.includes(selectedPaymentMethod)) {
          setSelectedPaymentMethod(data.evaluation.allowedMethods[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      if (selectedPaymentMethod === 'ONLINE') {
        // Stripe checkout
        const response = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Failed to initiate checkout');
        } else if (data.url) {
          window.location.href = data.url;
        }
      } else {
        // COD or ADVANCE checkout
        const formData = new FormData(
          document.querySelector('form') as HTMLFormElement
        );
        const shippingInfo = {
          fullName: formData.get('fullName') as string,
          email: formData.get('email') as string,
          address: formData.get('address') as string,
        };

        if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
          toast.error('Please fill in all shipping information');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
            paymentMethod: selectedPaymentMethod,
            shippingInfo,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Failed to place order');
        } else {
          toast.success('Order placed successfully!');
          router.push('/orders');
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <form className="space-y-6">
      {/* Shipping Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-primary-600" />
          Shipping Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Address *
          </label>
          <textarea
            name="address"
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            placeholder="Enter your full shipping address"
          />
        </div>
      </motion.div>

      {/* Payment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
          Payment Method
        </h2>

        {isLoadingMethods ? (
          <div className="text-center py-8 text-gray-500">
            Loading payment options...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Online Payment */}
            {availableMethods && (
              <div
                className={`flex items-center justify-between p-4 border rounded-lg transition cursor-pointer ${
                  selectedPaymentMethod === 'ONLINE'
                    ? 'border-primary-500 bg-primary-50'
                    : availableMethods.allowedMethods.includes('ONLINE')
                    ? 'hover:border-gray-300'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() =>
                  availableMethods.allowedMethods.includes('ONLINE') &&
                  setSelectedPaymentMethod('ONLINE')
                }
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    id="online"
                    checked={selectedPaymentMethod === 'ONLINE'}
                    onChange={() => setSelectedPaymentMethod('ONLINE')}
                    disabled={!availableMethods.allowedMethods.includes('ONLINE')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <label htmlFor="online" className="font-medium text-gray-700 cursor-pointer">
                      Credit / Debit Card
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                    MC
                  </div>
                </div>
              </div>
            )}

            {/* Cash on Delivery */}
            {availableMethods && (
              <div
                className={`flex items-center justify-between p-4 border rounded-lg transition cursor-pointer ${
                  selectedPaymentMethod === 'COD'
                    ? 'border-primary-500 bg-primary-50'
                    : availableMethods.allowedMethods.includes('COD')
                    ? 'hover:border-gray-300'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() =>
                  availableMethods.allowedMethods.includes('COD') && setSelectedPaymentMethod('COD')
                }
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    id="cod"
                    checked={selectedPaymentMethod === 'COD'}
                    onChange={() => setSelectedPaymentMethod('COD')}
                    disabled={!availableMethods.allowedMethods.includes('COD')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <div>
                      <label htmlFor="cod" className="font-medium text-gray-700 cursor-pointer block">
                        Cash on Delivery
                      </label>
                      <p className="text-xs text-gray-500">Pay when you receive</p>
                    </div>
                  </div>
                </div>
                {!availableMethods.allowedMethods.includes('COD') && (
                  <span className="text-xs text-red-500">Unavailable</span>
                )}
              </div>
            )}

            {/* Advance Payment */}
            {availableMethods && (
              <div
                className={`flex items-center justify-between p-4 border rounded-lg transition cursor-pointer ${
                  selectedPaymentMethod === 'ADVANCE'
                    ? 'border-primary-500 bg-primary-50'
                    : availableMethods.allowedMethods.includes('ADVANCE')
                    ? 'hover:border-gray-300'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() =>
                  availableMethods.allowedMethods.includes('ADVANCE') &&
                  setSelectedPaymentMethod('ADVANCE')
                }
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    id="advance"
                    checked={selectedPaymentMethod === 'ADVANCE'}
                    onChange={() => setSelectedPaymentMethod('ADVANCE')}
                    disabled={!availableMethods.allowedMethods.includes('ADVANCE')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-gray-600" />
                    <div>
                      <label htmlFor="advance" className="font-medium text-gray-700 cursor-pointer block">
                        Advance Payment
                      </label>
                      <p className="text-xs text-gray-500">
                        {availableMethods.advancePaymentMethods.includes('ADVANCE')
                          ? `Pay $${(availableMethods.methods.ADVANCE.advancePaymentRequirement?.amount || 0).toFixed(2)} now`
                          : 'Partial payment required'}
                      </p>
                    </div>
                  </div>
                </div>
                {!availableMethods.allowedMethods.includes('ADVANCE') && (
                  <span className="text-xs text-red-500">Unavailable</span>
                )}
              </div>
            )}

            {/* Payment Info Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPaymentMethod === 'ONLINE'
                      ? 'Your payment information is encrypted and secure. We use Stripe for payment processing.'
                      : selectedPaymentMethod === 'COD'
                      ? 'Pay with cash when your order is delivered. No additional fees.'
                      : 'Pay a partial amount now and the remaining amount on delivery.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Place Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCheckout}
          disabled={isLoading || isLoadingMethods}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : selectedPaymentMethod === 'ONLINE' ? (
            `Pay $${total.toFixed(2)}`
          ) : selectedPaymentMethod === 'ADVANCE' ? (
            `Pay $${availableMethods?.methods.ADVANCE.advancePaymentRequirement?.amount?.toFixed(2) || total.toFixed(2)} Now`
          ) : (
            `Place Order - $${total.toFixed(2)}`
          )}
        </motion.button>

        <p className="text-center text-sm text-gray-500 mt-3">
          By placing this order, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </form>
  );
}
