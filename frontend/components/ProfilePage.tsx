'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Star, Package, ShoppingBag, Edit, Trash2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import EditPostModal from './EditPostModal';
import { Post, Review, User as UserType } from '@/types';
import { publicPostsAPI, publicReviewsAPI, publicUsersAPI, useAuthenticatedPosts, useAuthenticatedReviews, UpdatePostData } from './api';

const DEFAULT_IMAGE = '/default_img.png';

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();
  const authenticatedPosts = useAuthenticatedPosts();
  const authenticatedReviews = useAuthenticatedReviews();
  const [userReputation, setUserReputation] = useState<UserType | null>(null);
  const [postedItems, setPostedItems] = useState<Post[]>([]);
  const [claimedItems, setClaimedItems] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posted' | 'claimed'>('posted');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [pickupPostId, setPickupPostId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [itemToReview, setItemToReview] = useState<Post | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      loadUserData();
    }
  }, [isSignedIn, user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user reputation
      const reputationData = await publicUsersAPI.getReputation(user.id);
      setUserReputation(reputationData);

      // Load all posts to filter by user
      const allPosts = await publicPostsAPI.getAll();
      
      // Filter posted items (owned by user)
      const posted = allPosts.filter(post => post.owner_id === user.id);
      setPostedItems(posted);

      // Filter claimed items (claimed by user)
      const claimed = allPosts.filter(post => post.claimed_by === user.id);
      setClaimedItems(claimed);

      // Load reviews
      const userReviews = await publicReviewsAPI.getByPosterId(user.id);
      setReviews(userReviews);

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = async (postId: string, data: UpdatePostData) => {
    try {
      const updatedPost = await authenticatedPosts.update(postId, data);
      setPostedItems(postedItems.map(item => 
        item.id === postId ? updatedPost : item
      ));
      setEditingPost(null);
      alert('Post updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      alert(`Error: ${errorMessage}`);
      throw err;
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await authenticatedPosts.delete(postId);
      setPostedItems(postedItems.filter(item => item.id !== postId));
      setDeletingPostId(null);
      alert('Post deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleConfirmPickup = async (postId: string) => {
    if (!user) return;
    
    // Find the post to get owner info for review
    const claimedItem = claimedItems.find(item => item.id === postId);
    const postedItem = postedItems.find(item => item.id === postId);
    const itemForReview = claimedItem || postedItem;
    
    // Close the pickup confirmation modal
    setPickupPostId(null);
    
    // Only show review form if user is the claimer (not the poster)
    if (claimedItem && itemForReview) {
      // Show review form BEFORE deleting the post
      setItemToReview(itemForReview);
      setShowReviewForm(true);
    } else {
      // If poster is confirming, delete immediately (no review needed)
      await deletePostAfterPickup(postId);
    }
  };

  const deletePostAfterPickup = async (postId: string) => {
    try {
      await authenticatedPosts.confirmPickup(postId);
      // Remove from both lists since item is now deleted
      setPostedItems(postedItems.filter(item => item.id !== postId));
      setClaimedItems(claimedItems.filter(item => item.id !== postId));
      alert('Item marked as picked up and removed from listings!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm pickup';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!user || !itemToReview) return;

    try {
      // Submit review first while post still exists
      await authenticatedReviews.create({
        poster_id: itemToReview.owner_id,
        post_id: itemToReview.id,
        rating,
        comment,
      });
      
      // After review is submitted, delete the post
      await deletePostAfterPickup(itemToReview.id);
      
      setShowReviewForm(false);
      setItemToReview(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      alert(`Failed to submit review: ${errorMessage}`);
      console.error('Error submitting review:', err);
      throw err;
    }
  };

  const handleSkipReview = async () => {
    if (!itemToReview) return;
    
    // User chose to skip review, just delete the post
    await deletePostAfterPickup(itemToReview.id);
    setShowReviewForm(false);
    setItemToReview(null);
  };

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info & Reputation Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold mb-4">Your Profile</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Username:</span> {user.username || user.firstName || 'User'}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Email:</span> {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-emerald-800">Reputation</h3>
            <div className="flex items-center gap-2 mb-2">
              <Star className="fill-yellow-400 text-yellow-400" size={24} />
              <span className="text-2xl font-bold text-emerald-700">
                {userReputation?.reputation.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-600">/ 5.0</span>
            </div>
            <p className="text-sm text-gray-600">
              Based on {userReputation?.review_count || 0} review{userReputation?.review_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Items Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'posted'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package size={20} />
              Posted Items ({postedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'claimed'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingBag size={20} />
              Claimed Items ({claimedItems.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'posted' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postedItems.length > 0 ? (
                postedItems.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 bg-gray-200">
                      <Image
                        src={item.images && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE}
                        alt={item.item_title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{item.item_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          item.status === 'claimed' 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status === 'claimed' ? 'Claimed - Awaiting Pickup' : 'Available'}
                        </span>
                        {item.status === 'claimed' ? (
                          <button
                            onClick={() => setPickupPostId(item.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                            title="Confirm item was picked up"
                          >
                            <CheckCircle size={14} />
                            Picked Up
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPost(item)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Edit listing"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingPostId(item.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-8">
                  You haven&apos;t posted any items yet.
                </p>
              )}
            </div>
          )}

          {activeTab === 'claimed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedItems.length > 0 ? (
                claimedItems.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 bg-gray-200">
                      <Image
                        src={item.images && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE}
                        alt={item.item_title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{item.item_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
                          Awaiting Pickup
                        </span>
                        <button
                          onClick={() => setPickupPostId(item.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          title="Confirm you picked up the item"
                        >
                          <CheckCircle size={14} />
                          I Picked It Up
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-8">
                  You haven&apos;t claimed any items yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewList reviews={reviews} title="Reviews Received" />

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={handleEditPost}
          onClose={() => setEditingPost(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeletePost(deletingPostId)}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingPostId(null)}
                className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Confirmation Modal */}
      {pickupPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Confirm Pickup</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Has this item been picked up? This will remove the listing from the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmPickup(pickupPostId)}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Yes, Item Picked Up
              </button>
              <button
                onClick={() => setPickupPostId(null)}
                className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && itemToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-xl w-full">
            <ReviewForm
              post={itemToReview}
              onSubmit={handleSubmitReview}
              onCancel={handleSkipReview}
            />
          </div>
        </div>
      )}
    </div>
  );
}