import React, { useState, useRef } from 'react';
import { X, Upload, MapPin } from 'lucide-react';

const categories = ['Furniture', 'Electronics', 'Clothing', 'Books', 'Other'];
const conditions = ['New', 'Like New', 'Used', 'For Parts'];

interface CreatePostProps {
  show: boolean;
  onClose: () => void;
  onCreatePost: (item: {
    item_title: string;
    description?: string;
    images: string[];
    category?: string;
    condition: string;
    location: string;
  }) => void;
}

export default function CreatePost({ show, onClose, onCreatePost }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[0]);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  if (!show) return null;

  const fetchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`,
        { signal: abortRef.current.signal }
      );
      
      if (!res.ok) return setSuggestions([]);
      const data = await res.json();
      
      const formatted = data.map((item: any) => {
        if (!item.address) return item.display_name;
        const parts = [];
        if (item.address.house_number && item.address.road) {
          parts.push(`${item.address.house_number} ${item.address.road}`);
        } else if (item.address.road) {
          parts.push(item.address.road);
        }
        if (item.address.city || item.address.town) parts.push(item.address.city || item.address.town);
        if (item.address.state) parts.push(item.address.state);
        if (item.address.postcode) parts.push(item.address.postcode);
        return parts.length > 0 ? parts.join(', ') : item.display_name;
      });
      
      setSuggestions(formatted.filter(Boolean));
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLocations(e.target.value), 400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('File must be under 5MB');
    if (!file.type.startsWith('image/')) return alert('Please select an image');

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return alert('Please fill required fields');

    onCreatePost({
      item_title: title,
      description: description || undefined,
      images: imagePreview ? [imagePreview] : [],
      category: category || undefined,
      condition,
      location,
    });

    setTitle('');
    setDescription('');
    setCategory(categories[0]);
    setCondition(conditions[0]);
    setLocation('');
    setImagePreview('');
    setSuggestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Item name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24"
              placeholder="Item description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Start typing a location..."
                required
              />
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setLocation(s); setSuggestions([]); }}
                    className="w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm">{s}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400 mt-1">Max size: 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <button type="button" onClick={() => setImagePreview('')} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">
              Create Post
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}