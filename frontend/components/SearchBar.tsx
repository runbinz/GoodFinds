import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

const statusOptions = ['All', 'Available', 'Claimed'];
const conditionOptions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Used'];

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  status: string;
  onStatusChange: (status: string) => void;
  condition: string;
  onConditionChange: (condition: string) => void;
  isSignedIn?: boolean;
  onCreatePost?: () => void;
}

export default function SearchBar({ 
  search, 
  onSearchChange, 
  category, 
  onCategoryChange, 
  categories,
  status,
  onStatusChange,
  condition,
  onConditionChange,
  isSignedIn = false,
  onCreatePost
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || status !== 'All' || condition !== 'All'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={18} />
          Filters
          {(status !== 'All' || condition !== 'All') && (
            <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(status !== 'All' ? 1 : 0) + (condition !== 'All' ? 1 : 0)}
            </span>
          )}
        </button>
        {isSignedIn && onCreatePost && (
          <button
            onClick={onCreatePost}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Create Post
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === cat 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Additional Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => onStatusChange(opt)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    status === opt 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <div className="flex gap-2 flex-wrap">
              {conditionOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => onConditionChange(opt)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    condition === opt 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}