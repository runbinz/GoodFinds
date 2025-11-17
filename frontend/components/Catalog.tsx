import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Item, categories } from '../types';
import Card from './Card';
import SearchBar from './SearchBar';

interface CatalogProps {
  items: Item[];
}

export default function Catalog({ items }: CatalogProps) {
  const { isSignedIn } = useUser();
  const [itemsState, setItemsState] = useState<Item[]>(items);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Electronics', price: '' });

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

  const handleCreatePost = () => {
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all fields');
      return;
    }

    const item: Item = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      price: parseFloat(newItem.price),
    };

    setItemsState([item, ...itemsState]);
    setNewItem({ name: '', category: 'Electronics', price: '' });
    setShowCreatePost(false);
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
        {filtered.map(item => <Card key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">Category: {selectedItem.category}</p>
            <p className="text-3xl font-bold text-emerald-600 mb-6">${selectedItem.price}</p>
            {!isSignedIn && (
              <p className="text-sm text-gray-600 mb-4">Sign in to claim this item</p>
            )}
            <div className="flex gap-4">
              <button onClick={handleClaim} className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Claim
              </button>
              <button onClick={() => setSelectedItem(null)} className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreatePost(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
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
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreatePost}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
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