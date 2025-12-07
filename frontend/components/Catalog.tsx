import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Image from 'next/image';
import { Star, User as UserIcon } from 'lucide-react';
import Card from './Card';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import UserProfileModal from './UserProfileModal';
import { Post, User } from '@/types';
import { publicPostsAPI, publicUsersAPI, useAuthenticatedPosts } from './api';
import { CreatePostData } from './api';

const categories = ['All', 'Furniture', 'Electronics', 'Clothing', 'Books', 'Other'];

const DEFAULT_IMAGE = '/default_img.png';

export default function Catalog() {
  const { isSignedIn, user } = useUser();
  const authenticatedPosts = useAuthenticatedPosts();
  
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [posterReputations, setPosterReputations] = useState<Map<string, User>>(new Map());
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts from API...');
      const posts = await publicPostsAPI.getAll();
      console.log('Posts fetched:', posts);
      setItems(posts);

      const uniqueOwnerIds = [...new Set(posts.map(post => post.owner_id))];
      const reputationMap = new Map<string, User>();
      
      await Promise.all(
        uniqueOwnerIds.map(async (ownerId) => {
          try {
            const userData = await publicUsersAPI.getReputation(ownerId);
            reputationMap.set(ownerId, userData);
          } catch (err) {
            console.error(`Failed to fetch reputation for user ${ownerId}:`, err);
          }
        })
      );
      
      setPosterReputations(reputationMap);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      console.error('Error fetching posts:', err);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
      setError(`${errorMessage}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(p => {
    const matchesSearch = p.item_title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    const matchesCondition = condition === 'All' || p.condition === condition;
    
    // Only show available items in public catalog
    // If the current user has already reported this post, it will no longer be displayed to that user after refreshing
        const reportedByMe =
      !!user?.id && (p.missing_reporters ?? []).includes(user.id);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      p.status === 'available' &&
      !reportedByMe
    );
  });

  const isOwnPost = selectedItem && user && selectedItem.owner_id === user.id;
  const userId = user?.id;
  const reportMissingGate = React.useMemo(() => {
    if (!selectedItem) return { canReport: false, hint: '' };
    if (!isSignedIn || !userId) {
      return { canReport: false, hint: 'Sign in to report missing' };
    }
    if (selectedItem.owner_id === userId) {
      return { canReport: false, hint: "You can't report your own listing" };
    }
    if (selectedItem.status !== 'claimed') {
      return { canReport: false, hint: 'You can only report missing after the item is claimed' };
    }
    if (!selectedItem.claimed_by) {
      return { canReport: false, hint: 'Claimed item missing claimed_by (data issue)' };
    }
    if (selectedItem.claimed_by !== userId) {
      return { canReport: false, hint: 'Only the claimer can report missing' };
    }
    if ((selectedItem.missing_reporters ?? []).includes(userId)) {
      return { canReport: false, hint: 'You already reported this item' };
    }
    return { canReport: true, hint: '' };
  }, [selectedItem, isSignedIn, userId]);


  const handleClaim = async () => {
    if (!isSignedIn || !user) {
      alert('Please sign in to claim items');
      return;
    }

    if (!selectedItem) return;

    if (selectedItem.status === 'claimed') {
      alert('This item has already been claimed');
      return;
    }

    try {
      const updatedPost = await authenticatedPosts.claim(selectedItem.id);
      setItems(items.map(item => item.id === updatedPost.id ? updatedPost : item));
      setSelectedItem(null);
      alert('Item claimed successfully! You can confirm pickup from your Profile page.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to claim item');
      console.error('Error claiming post:', err);
    }
  };

  // Report missing handler
  const handleReportMissing = async () => {
    
    if (!reportMissingGate.canReport) {
      if (reportMissingGate.hint) alert(reportMissingGate.hint);
      return;
    }

    if (!isSignedIn || !user) {
      alert('Please sign in to report missing items.');
      return;
    }

    if (!selectedItem) return;

    try {
      const updatedPost = await authenticatedPosts.reportMissing(selectedItem.id);

      // Remove this item from the current list (as it has been reported to be missing/may no longer be available)
      setItems(items.filter(item => item.id !== updatedPost.id));
      setSelectedItem(null);

      alert('Thanks! The item has been reported as missing.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to report missing');
      console.error('Error reporting missing:', err);
    }
  };


  // Create new post handler
  const handleCreatePost = async (newItem: CreatePostData) => {
    if (!isSignedIn || !user) {
      alert('Please sign in to create posts');
      return;
    }

    console.log('Creating post with data:', newItem);

    try {
      const createdPost = await authenticatedPosts.create(newItem);

      console.log('Post created successfully:', createdPost);
      setItems([createdPost, ...items]);
      setShowCreatePost(false);
      alert('Post created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      console.error('Error creating post:', err);
      console.error('Error details:', errorMessage);
      alert(`Failed to create post: ${errorMessage}`);
    }
  };

  const displayImages = selectedItem?.images && selectedItem.images.length > 0 
    ? selectedItem.images 
    : [DEFAULT_IMAGE];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        condition={condition}
        onConditionChange={setCondition}
        isSignedIn={isSignedIn}
        onCreatePost={() => setShowCreatePost(true)}
      />

      <div className="grid grid-cols-3 gap-6">
        {filtered.map(item => {
          const posterData = posterReputations.get(item.owner_id);
          return (
            <Card 
              key={item.id} 
              item={item}
              posterReputation={posterData?.reputation}
              posterReviewCount={posterData?.review_count}
              onClick={() => {
                setSelectedItem(item);
                setCurrentImageIndex(0);
              }} 
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No items found. {isSignedIn && 'Create the first post!'}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-200">
                <Image 
                  src={displayImages[currentImageIndex]} 
                  alt={selectedItem.item_title}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                  priority
                />
              </div>
              {displayImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-4">{selectedItem.item_title}</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setViewingProfileUserId(selectedItem.owner_id);
                }}
                className="flex items-center gap-3 w-full text-left hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                  <UserIcon size={20} className="text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {posterReputations.get(selectedItem.owner_id)?.username || 'View Poster'}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span>
                      {posterReputations.get(selectedItem.owner_id)?.reputation?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-400">
                      ({posterReputations.get(selectedItem.owner_id)?.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
                <span className="text-emerald-600 text-sm font-medium">View Profile →</span>
              </button>
            </div>

            <p className="text-gray-600 mb-2">Category: {selectedItem.category}</p>
            <p className="text-gray-600 mb-2">Condition: {selectedItem.condition}</p>
            <p className="text-gray-600 mb-2">Location: {selectedItem.location}</p>
            <p className="text-gray-700 mb-4">{selectedItem.description}</p>
            
            {selectedItem.status === 'claimed' && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <p className="font-semibold">This item has been claimed</p>
                <p className="text-sm mt-1">Awaiting pickup by the claimer</p>
              </div>
            )}

            {isOwnPost && selectedItem.status !== 'claimed' && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700">
                <p className="font-semibold">This is your listing</p>
                <p className="text-sm">You can manage it from your Profile page.</p>
              </div>
            )}

            {!isSignedIn && selectedItem.status !== 'claimed' && (
              <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                Sign in to claim this item
              </p>
            )}
            
            <div className="flex gap-4">
              {selectedItem.status !== 'claimed' ? (
                <button 
                  onClick={handleClaim} 
                  disabled={!isSignedIn || isOwnPost}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSignedIn && !isOwnPost
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!isSignedIn ? 'Sign In to Claim' : isOwnPost ? 'Your Listing' : 'Claim Item'}
                </button>
              ) : (
                <button 
                  className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                  disabled
                >
                  Awaiting Pickup
                </button>
              )}

              {/* Report Missing (always visible, but gated/disabled with hint) */}
              <div className="flex-1">
                <button
                  onClick={handleReportMissing}
                  disabled={!reportMissingGate.canReport}
                  title={!reportMissingGate.canReport ? reportMissingGate.hint : ''}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                  reportMissingGate.canReport
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Report Missing
                </button>

              {!reportMissingGate.canReport && reportMissingGate.hint && (
                <div className="mt-1 text-xs text-gray-500">{reportMissingGate.hint}</div>
              )}
             </div>

              <button 
                onClick={() => setSelectedItem(null)} 
                className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <CreatePost
        show={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {viewingProfileUserId && (
        <UserProfileModal
          userId={viewingProfileUserId}
          onClose={() => setViewingProfileUserId(null)}
        />
      )}
    </div>
  );
}
