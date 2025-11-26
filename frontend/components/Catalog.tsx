import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Image from 'next/image';
import Card from './Card';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';
import { Post } from '@/types';
import { publicPostsAPI, useAuthenticatedPosts } from './api';

const categories = ['All', 'Furniture', 'Electronics', 'Clothing', 'Books', 'Other'];

const DEFAULT_IMAGE = '/default_img.png';

export default function Catalog() {
  const { isSignedIn, user } = useUser();
  // Hook for authenticated operations
  const authenticatedPosts = useAuthenticatedPosts();
  
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch posts from backend
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts from API...');
      // Use public API for viewing
      const posts = await publicPostsAPI.getAll();
      console.log('Posts fetched:', posts);
      setItems(posts);
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

  // Client-side filtering
  const filtered = items.filter(p => 
    p.item_title.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );

  const handleClaim = async () => {
    if (!isSignedIn || !user) {
      alert('Please sign in to claim items');
      return;
    }

    if (!selectedItem) return;

    // Check if already claimed
    if (selectedItem.status === 'claimed') {
      alert('This item has already been claimed');
      return;
    }

    try {
      // Use authenticated API for claiming
      const updatedPost = await authenticatedPosts.claim(selectedItem.id);
      
      // Update local state
      setItems(items.map(item => 
        item.id === updatedPost.id ? updatedPost : item
      ));
      
      setSelectedItem(updatedPost);
      alert(`Successfully claimed: ${updatedPost.item_title}!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to claim item');
      console.error('Error claiming post:', err);
    }
  };

  const handleCreatePost = async (newItem: {
    item_title: string;
    description?: string;
    images: string[];
    category?: string;
    condition: string;
    location: string;
  }) => {
    if (!isSignedIn || !user) {
      alert('Please sign in to create posts');
      return;
    }

    console.log('Creating post with data:', newItem);

    try {
      // Use authenticated API for creating
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
        isSignedIn={isSignedIn}
        onCreatePost={() => setShowCreatePost(true)}
      />

      <div className="grid grid-cols-3 gap-6">
        {filtered.map(item => (
          <Card 
            key={item.id} 
            item={item}
            onClick={() => {
              setSelectedItem(item);
              setCurrentImageIndex(0);
            }} 
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No items found. {isSignedIn && 'Create the first post!'}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
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
            <p className="text-gray-600 mb-2">Category: {selectedItem.category}</p>
            <p className="text-gray-600 mb-2">Condition: {selectedItem.condition}</p>
            <p className="text-gray-600 mb-2">Location: {selectedItem.location}</p>
            <p className="text-gray-700 mb-4">{selectedItem.description}</p>
            
            {selectedItem.status === 'claimed' && (
              <div className="mb-4 p-3 rounded-lg bg-gray-100 text-gray-700">
                <p className="font-semibold">This item has been claimed</p>
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
                  disabled={!isSignedIn}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSignedIn 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSignedIn ? 'Claim Item' : 'Sign In to Claim'}
                </button>
              ) : (
                <button 
                  className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                  disabled
                >
                  Already Claimed
                </button>
              )}
              
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
    </div>
  );
}