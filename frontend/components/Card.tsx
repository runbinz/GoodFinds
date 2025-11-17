import { Star } from 'lucide-react';
import { Item } from '../types';

interface CardProps {
  item: Item;
}

export default function Card({ item }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
      <div className="text-sm text-gray-600 mb-2">{item.category}</div>
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
          />
        ))}
      </div>
      <div className="text-2xl font-bold text-emerald-600">${item.price}</div>
    </div>
  );
}