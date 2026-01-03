'use client';

import { ShoppingCart, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  session: any;
  compact?: boolean;
}

export default function AddToCartButton({
  productId,
  stock,
  session,
  compact = false,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: currentSession } = useSession();
  const router = useRouter();
  const userSession = currentSession || session;

  const addToCart = async () => {
    if (!userSession) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/signin');
      return;
    }

    if (stock === 0) {
      toast.error('This product is out of stock');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Added to cart!', {
          description: 'Item has been added to your cart',
          action: {
            label: 'View Cart',
            onClick: () => router.push('/checkout'),
          },
        });

        // Trigger cart update event
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('An error occurred while adding to cart');
    }

    setIsLoading(false);
  };

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={addToCart}
        disabled={stock === 0 || isLoading}
        className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
          stock === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/30'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            <span>{stock === 0 ? 'Out of Stock' : 'Quick Add'}</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addToCart}
        disabled={stock === 0 || isLoading}
        className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
          stock === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-xl hover:shadow-primary-500/30'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>{stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </>
        )}
      </motion.button>

      {stock > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addToCart}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Buy Now</span>
        </motion.button>
      )}

      {stock < 10 && stock > 0 && (
        <p className="text-center text-sm text-orange-600 font-medium">
          Only {stock} left in stock - order soon!
        </p>
      )}
    </div>
  );
}
