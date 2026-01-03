'use client';

import { CheckCircle, Award, Shield, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface VendorTrustBadgesProps {
  badges?: string[];
  trustScore: number;
  paidOnTimeStreak: number;
  totalOrders: number;
  successfulDeliveries: number;
}

export default function VendorTrustBadges({
  badges,
  trustScore,
  paidOnTimeStreak,
  totalOrders,
  successfulDeliveries,
}: VendorTrustBadgesProps) {
  const badgeList = badges || [];

  const deliverySuccessRate = totalOrders > 0
    ? Math.round((successfulDeliveries / totalOrders) * 100)
    : 0;

  const availableBadges = {
    PAID_ON_TIME: {
      icon: CheckCircle,
      label: 'Paid on Time',
      description: `${paidOnTimeStreak}+ consecutive payments`,
      color: 'green',
    },
    TOP_SELLER: {
      icon: Award,
      label: 'Top Seller',
      description: 'High sales performance',
      color: 'purple',
    },
    TRUSTED: {
      icon: Shield,
      label: 'Trusted Vendor',
      description: 'Verified seller',
      color: 'blue',
    },
    FAST_DELIVERY: {
      icon: TrendingUp,
      label: 'Fast Delivery',
      description: `${deliverySuccessRate}% success rate`,
      color: 'orange',
    },
    PREMIUM: {
      icon: Star,
      label: 'Premium Vendor',
      description: `Trust score: ${Math.round(trustScore)}/100`,
      color: 'yellow',
    },
  };

  return (
    <div className="space-y-4">
      {/* Trust Score Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Trust Score</span>
          <span className="text-lg font-bold text-primary-600">
            {Math.round(trustScore)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trustScore}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on sales, delivery, and payment history
        </p>
      </div>

      {/* Earned Badges */}
      {badgeList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Trust Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badgeList.map((badgeKey: string) => {
              const badge = availableBadges[badgeKey as keyof typeof availableBadges];
              if (!badge) return null;

              const Icon = badge.icon;
              const colorClasses = {
                green: 'bg-green-100 text-green-700 border-green-200',
                purple: 'bg-purple-100 text-purple-700 border-purple-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                orange: 'bg-orange-100 text-orange-700 border-orange-200',
                yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
              };

              return (
                <motion.div
                  key={badgeKey}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[badge.color as keyof typeof colorClasses]}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{badge.label}</p>
                    <p className="text-xs opacity-80">{badge.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-lg p-4 border border-primary-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Orders</span>
            <span className="font-semibold text-gray-900">{totalOrders}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Successful Deliveries</span>
            <span className="font-semibold text-gray-900">{successfulDeliveries}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Success Rate</span>
            <span className="font-semibold text-green-600">{deliverySuccessRate}%</span>
          </div>
          {paidOnTimeStreak > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On-Time Payments</span>
              <span className="font-semibold text-blue-600">{paidOnTimeStreak} streak 🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* How to Earn Badges */}
      {badgeList.length < 5 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 How to Earn More Badges</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            {!badgeList.includes('PAID_ON_TIME') && (
              <li>✓ Complete 5+ on-time payments for &quot;Paid on Time&quot; badge</li>
            )}
            {!badgeList.includes('TOP_SELLER') && (
              <li>✓ Achieve high sales for &quot;Top Seller&quot; badge</li>
            )}
            {!badgeList.includes('FAST_DELIVERY') && (
              <li>✓ Maintain 95%+ delivery success for &quot;Fast Delivery&quot; badge</li>
            )}
            {!badgeList.includes('PREMIUM') && (
              <li>✓ Reach 80+ trust score for &quot;Premium Vendor&quot; badge</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
