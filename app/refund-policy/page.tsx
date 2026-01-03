import { Metadata } from 'next';
import { Shield, Clock, Package, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BRAND_NAME, BRAND_CONTACT, BRAND_LEGAL_NAME } from '@/config/brand';

export const metadata: Metadata = {
  title: `Refund & Return Policy | ${BRAND_NAME}`,
  description: `Learn about ${BRAND_NAME}'s refund and return policy. We offer hassle-free returns and refunds within specified timeframes.`,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Refund & Return Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your satisfaction is our priority. Learn about our hassle-free return process.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-primary-600" />
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              At <strong>{BRAND_NAME}</strong>, we want you to be completely satisfied with your purchase.
              If you&apos;re not happy with your order, we&apos;re here to help. This policy outlines the terms
              and conditions for returns and refunds.
            </p>
          </section>

          {/* Return Timeframe */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary-600" />
              Return Timeframe
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="font-semibold text-green-900">Standard Returns</p>
                <p className="text-green-700 text-sm mt-1">
                  You may return most new, unopened items within <strong>30 days</strong> of delivery
                  for a full refund.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="font-semibold text-blue-900">Defective or Damaged Items</p>
                <p className="text-blue-700 text-sm mt-1">
                  If you receive a defective or damaged item, please contact us within <strong>7 days</strong>{' '}
                  for a replacement or full refund.
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <p className="font-semibold text-orange-900">Personalized Items</p>
                <p className="text-orange-700 text-sm mt-1">
                  Personalized or customized items cannot be returned unless they arrive damaged or defective.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Methods */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary-600" />
              Refund Methods
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Original Payment Method</p>
                <p className="text-gray-600 text-sm mt-1">
                  Refunds are typically processed to your original payment method within 5-10 business days.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cash on Delivery (COD) Orders</p>
                <p className="text-gray-600 text-sm mt-1">
                  For COD orders, refunds will be processed via bank transfer or store credit.
                  You&apos;ll need to provide your bank account details.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Store Credit</p>
                <p className="text-gray-600 text-sm mt-1">
                  You may choose to receive store credit instead of a refund, which can be used for future purchases.
                </p>
              </div>
            </div>
          </section>

          {/* How to Request a Refund */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Contact Us</p>
                  <p className="text-gray-600 text-sm">
                    Send an email to <Link href={`mailto:${BRAND_CONTACT.supportEmail}`} className="text-primary-600 hover:underline">{BRAND_CONTACT.supportEmail}</Link> or use our{' '}
                    <Link href="/contact" className="text-primary-600 hover:underline">contact form</Link> with your order details.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Provide Details</p>
                  <p className="text-gray-600 text-sm">Include your order number, reason for return, and photos (if damaged).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Wait for Approval</p>
                  <p className="text-gray-600 text-sm">Our team will review your request within 24-48 hours.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Return Item</p>
                  <p className="text-gray-600 text-sm">Once approved, ship the item back using the provided return label.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Receive Refund</p>
                  <p className="text-gray-600 text-sm">After we receive and inspect the item, your refund will be processed.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Conditions */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Conditions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-green-700 font-semibold mb-2">✓ Items Must Be:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• In original condition</li>
                  <li>• Unworn and unwashed</li>
                  <li>• With all tags attached</li>
                  <li>• In original packaging</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-red-700 font-semibold mb-2">✗ Cannot Return:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Used or worn items</li>
                  <li>• Items without tags</li>
                  <li>• Personalized items</li>
                  <li>• Final sale items</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Shipping Costs</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Free returns</strong> for defective or damaged items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Free returns</strong> for items shipped in error</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span><strong>Customer pays</strong> return shipping for change of mind</span>
              </li>
            </ul>
          </section>

          {/* Important Note */}
          <section className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-6 border border-primary-100">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">Important Note</p>
                <p className="text-gray-700 text-sm">
                  {BRAND_LEGAL_NAME} reserves the right to modify this refund policy at any time.
                  Any changes will be posted on this page with an updated &quot;Last Updated&quot; date.
                </p>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="border-t border-gray-100 pt-8 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions about our refund policy?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
