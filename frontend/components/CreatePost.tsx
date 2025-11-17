import React, { useState } from 'react';
import { Item } from '../types';

interface CreatePostProps {
  show: boolean;
  onClose: () => void;
  onCreatePost: (item: Item) => void;
}

export default function CreatePost({ show, onClose, onCreatePost }: CreatePostProps) {
  const [newItem, setNewItem] = useState({ 
    name: '', 
    category: 'All', 
    price: '' 
  });
  const [newItemImages, setNewItemImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const totalImages = newItemImages.length + files.length;
    if (totalImages > 9) {
      alert('You can only upload up to 9 images');
      return;
    }

    const newImages: string[] = [];
    const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    Array.from(files).forEach(file => {
      if (!validFileTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a valid image type. Please upload only PNG or JPG files.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === Array.from(files).filter(f => validFileTypes.includes(f.type)).length) {
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

  const handleSubmit = () => {
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all fields');
      return;
    }

    const item: Item = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      price: parseFloat(newItem.price),
      images: newItemImages.length > 0 ? newItemImages : undefined,
      claimed: false,
    };

    onCreatePost(item);
    setNewItem({ name: '', category: 'All', price: '' });
    setNewItemImages([]);
  };

  const handleClose = () => {
    setNewItem({ name: '', category: 'All', price: '' });
    setNewItemImages([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Create New Post</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-emerald-500"
              placeholder="Enter item name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-emerald-500"
            >
              <option value="All">None</option>
              <option value="Electronics">Electronics</option>
              <option value="Food">Food</option>
              <option value="Sports">Sports</option>
              <option value="Home">Home</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Images ({newItemImages.length}/9)
            </label>
            <div className="border border-dashed border-gray-300 rounded p-4">
              {newItemImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {newItemImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {newItemImages.length < 9 && (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="text-2xl mb-2 text-gray-400">+</div>
                    <p className="text-sm text-gray-500 text-center">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG or JPG</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={newItemImages.length >= 9}
                  />
                </label>
              )}
            </div>
            {newItemImages.length >= 9 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 9 images reached</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded font-medium hover:bg-emerald-600"
            >
              Create
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 px-4 py-2 rounded font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}