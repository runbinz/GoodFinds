import { Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Your Reviews</h3>
      {reviews.map(review => (
        <div key={review.id} className="border-b pb-4 mb-4">
          <div className="flex justify-between mb-2">
            <h4 className="font-semibold">{review.itemName}</h4>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
              />
            ))}
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
      {reviews.length === 0 && <p className="text-gray-500">No reviews yet</p>}
    </div>
  );
}