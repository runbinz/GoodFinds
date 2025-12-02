'use client';
import React, { useState, useEffect } from 'react';
import { Star, X, Package } from 'lucide-react';
import Image from 'next/image';
import { Post, Review, User } from '@/types';
import { publicPostsAPI, publicReviewsAPI, publicUsersAPI } from './api';

const DEFAULT_IMAGE = '/default_img.png';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [userReputation, setUserReputation] = useState<User | null>(null);
  const [postedItems, setPostedItems] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load user reputation
      const reputationData = await publicUsersAPI.getReputation(userId);
      setUserReputation(reputationData);

      // Load all posts and filter by this user
      const allPosts = await publicPostsAPI.getAll();
      const userPosts = allPosts.filter(post => post.owner_id === userId);
      setPostedItems(userPosts);

      // Load reviews for this user
      const userReviews = await publicReviewsAPI.getByPosterId(userId);
      setReviews(userReviews);

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="text-center text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info & Reputation */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-700">
                  {userReputation?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{userReputation?.username || 'User'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="text-lg font-bold text-emerald-700">
                    {userReputation?.reputation?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-600">/ 5.0</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({userReputation?.review_count || 0} review{userReputation?.review_count !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Posted */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package size={20} />
              Items Posted ({postedItems.length})
            </h3>
            {postedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {postedItems.slice(0, 6).map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="relative h-24 bg-gray-200">
                      <Image
                        src={item.images && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE}
                        alt={item.item_title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="font-medium text-sm truncate">{item.item_title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'claimed' 
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.status === 'claimed' ? 'Claimed' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No items posted yet</p>
            )}
            {postedItems.length > 6 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                And {postedItems.length - 6} more items...
              </p>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star size={20} />
              Reviews Received ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                          />
                        ))}
                        <span className="ml-1 text-sm font-semibold">{review.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
            {reviews.length > 5 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                And {reviews.length - 5} more reviews...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

