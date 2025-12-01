'use client';
import { Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
  title?: string;
}

export default function ReviewList({ reviews, title = "Reviews Received" }: ReviewListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {reviews.map(review => (
        <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                />
              ))}
              <span className="ml-2 font-semibold text-gray-700">{review.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
          </div>
          {review.comment && (
            <p className="text-gray-700 mt-2">{review.comment}</p>
          )}
        </div>
      ))}
      {reviews.length === 0 && (
        <p className="text-gray-500 text-center py-4">No reviews yet</p>
      )}
    </div>
  );
}