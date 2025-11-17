import { Search } from 'lucide-react';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function SearchBar({ 
  search, 
  onSearchChange, 
  category, 
  onCategoryChange, 
  categories 
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2">
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
    </div>
  );
}