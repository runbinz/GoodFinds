import Image from 'next/image';
import { Post } from '../types';

interface CardProps {
  item: Post;
  onClick?: () => void;
}

const DEFAULT_IMAGE = '/default_img.png';

export default function Card({ item, onClick }: CardProps) {
  const displayImage = item.images && item.images.length > 0 
    ? item.images[0] 
    : DEFAULT_IMAGE;

  // Debug logging
  console.log('Card item:', item);

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="h-48 w-full bg-gray-200 relative">
        <Image 
          src={displayImage} 
          alt={item.item_title || 'Item'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-2">
          {item.item_title || 'Untitled Item'}
        </h3>
        <div className="text-sm text-gray-600 mb-2">{item.category || 'Other'}</div>
        {item.status === 'claimed' && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-2">
            Claimed
          </div>
        )}
      </div>
    </div>
  );
}