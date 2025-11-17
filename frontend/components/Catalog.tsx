'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Item, categories } from '../types';
import Card from './Card';
import SearchBar from './SearchBar';

interface CatalogProps {
  items: Item[];
}

export default function Catalog({ items }: CatalogProps) {
  const { isSignedIn, user } = useUser();
  const [itemsState, setItemsState] = useState<Item[]>(items);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'All', price: '' });
  const [newItemImages, setNewItemImages] = useState<string[]>([]);

  const filtered = itemsState.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );

  const handleClaim = () => {
    if (!isSignedIn) {
      alert('Please sign in to claim items');
      return;
    }
    alert(`Claimed: ${selectedItem?.name}`);
    setSelectedItem(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const totalImages = newItemImages.length + files.length;
    if (totalImages > 9) {
      alert('You can only upload up to 9 images');
      return;
    }
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === files.length) {
            setNewItemImages(prev => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewItemImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'guest_user',
          item_title: newItem.name,
          description: '',
          images: newItemImages,
          category: newItem.category,
          condition: 'good',
          location: 'Boston',
        }),
      });
      if (!res.ok) throw new Error('Failed to create post');
      const created = await res.json();
      const formatted: Item = {
        id: created.id,
        name: created.item_title,
        category: created.category || 'Other',
        price: 0,
        images: created.images || [],
      };
      setItemsState(prev => [formatted, ...prev]);
      setNewItem({ name: '', category: 'All', price: '' });
      setNewItemImages([]);
      setShowCreatePost(false);
      alert('✅ Post created!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to create post');
    }
  };

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
          <Card key={item.id} item={item} onClick={() => setSelectedItem(item)} />
        ))}
      </div>
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">Category: {selectedItem.category}</p>
            <p className="text-3xl font-bold text-emerald-600 mb-6">
              ${selectedItem.price}
            </p>
            {!isSignedIn && (
              <p className="text-sm text-gray-600 mb-4">Sign in to claim this item</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleClaim}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Claim
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreatePost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreatePost(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={e =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={e =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="All">None</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food">Food</option>
                  <option value="Sports">Sports</option>
                  <option value="Home">Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={e =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Images ({newItemImages.length}/9)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {newItemImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {newItemImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {newItemImages.length < 9 && (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={newItemImages.length >= 9}
                      />
                    </label>
                  )}
                </div>
                {newItemImages.length >= 9 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum 9 images reached
                  </p>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreatePost}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewItemImages([]);
                  }}
                  className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
