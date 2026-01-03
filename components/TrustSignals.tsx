'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Store, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  todayOrders: number;
  activeVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  codAvailable: boolean;
}

export default function TrustSignals() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-4 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-orange-500 py-6 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Today's Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition"
          >
            <ShoppingBag className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.todayOrders}</div>
            <div className="text-sm text-white/90 font-medium">Orders Today</div>
          </motion.div>

          {/* Active Vendors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition"
          >
            <Store className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.activeVendors}</div>
            <div className="text-sm text-white/90 font-medium">Active Vendors</div>
          </motion.div>

          {/* Total Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition"
          >
            <TrendingUp className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{stats.totalProducts}</div>
            <div className="text-sm text-white/90 font-medium">Products</div>
          </motion.div>

          {/* COD Available Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition"
          >
            <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">COD ✓</div>
            <div className="text-sm text-white/90 font-medium">Cash on Delivery</div>
          </motion.div>
        </div>

        {/* Trust Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 text-white/90 text-sm font-medium"
        >
          ✓ Trusted by {stats.totalOrders}+ customers | Safe & Secure Shopping
        </motion.div>
      </div>
    </div>
  );
}
