import { Item } from '../types';

interface CardProps {
  item: Item;
  onClick?: () => void;
}

const DEFAULT_IMAGE = '/default_img.png';

export default function Card({ item, onClick }: CardProps) {
  const displayImage = item.images && item.images.length > 0 
    ? item.images[0] 
    : DEFAULT_IMAGE;

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition w-80 h-96 flex flex-col"
      onClick={onClick}
    >
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={displayImage} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.name}</h3>
          <div className="text-sm text-gray-600 mb-2">{item.category}</div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">${item.price}</div>
      </div>
    </div>
  );
}