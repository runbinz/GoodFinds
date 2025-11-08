import { Review } from '../types';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ProfilePageProps {
  reviews: Review[];
  onAddReview: (name: string, rating: number, comment: string) => void;
}

export default function ProfilePage({ reviews, onAddReview }: ProfilePageProps) {
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
        <p className="text-gray-600">{reviews.length} reviews written</p>
      </div>

      <ReviewForm onSubmit={onAddReview} />
      <ReviewList reviews={reviews} />
    </div>
  );
}