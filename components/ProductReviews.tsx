'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';
import { motion } from 'framer-motion';

interface ProductReviewsProps {
  productId: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    user: {
      name: string | null;
    };
  }>;
}

export default function ProductReviews({ productId, reviews: initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleReviewSubmitted = () => {
    // Refresh the page to show the new review
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Reviews List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span>Reviews</span>
          <span className="ml-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            {reviews.length}
          </span>
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="ml-3 font-semibold text-gray-900">
                      {review.user.name || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>
        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      </div>
    </motion.div>
  );
}
