import { Item } from '../types';

interface CardProps {
  item: Item;
  onClick?: () => void;
}

export default function Card({ item, onClick }: CardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
      <div className="text-sm text-gray-600 mb-2">{item.category}</div>
      <div className="flex items-center gap-1 mb-2">
      </div>
      <div className="text-2xl font-bold text-emerald-600">${item.price}</div>
    </div>
  );
}