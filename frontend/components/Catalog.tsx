import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Item, categories } from '../types';
import Card from './Card';
import SearchBar from './SearchBar';
import CreatePost from './CreatePost';

interface CatalogProps {
  items: Item[];
}

const DEFAULT_IMAGE = '/default_img.png';

export default function Catalog({ items }: CatalogProps) {
  const { isSignedIn } = useUser();
  const [itemsState, setItemsState] = useState<Item[]>(items);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filtered = itemsState.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );

  const handleClaim = () => {
    if (!isSignedIn) {
      alert('Please sign in to claim items');
      return;
    }

    if (!selectedItem) return;

    // Check if already claimed
    if (selectedItem.claimed) {
      alert('This item has already been claimed');
      return;
    }

    // Update the item to claimed
    const updatedItems = itemsState.map(item => 
      item.id === selectedItem.id 
        ? { ...item, claimed: true }
        : item
    );

    setItemsState(updatedItems);
    
    // Update selectedItem to reflect the claim
    setSelectedItem({
      ...selectedItem,
      claimed: true
    });

    alert(`Successfully claimed: ${selectedItem.name}!`);
  };

  const handleCreatePost = (newItem: Item) => {
    setItemsState([newItem, ...itemsState]);
    setShowCreatePost(false);
  };

  const displayImages = selectedItem?.images && selectedItem.images.length > 0 
    ? selectedItem.images 
    : [DEFAULT_IMAGE];

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

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <img 
                src={displayImages[currentImageIndex]} 
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-lg"
              />
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
            
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">Category: {selectedItem.category}</p>
            <p className="text-3xl font-bold text-emerald-600 mb-4">${selectedItem.price}</p>
            
            {/* Claim Status Display */}
            {selectedItem.claimed && (
              <div className="mb-4 p-3 rounded-lg bg-gray-100 text-gray-700">
                <p className="font-semibold">This item has been claimed</p>
              </div>
            )}

            {!isSignedIn && !selectedItem.claimed && (
              <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                Sign in to claim this item
              </p>
            )}
            
            <div className="flex gap-4">
              {!selectedItem.claimed ? (
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