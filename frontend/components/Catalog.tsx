import { Item } from '../types';
import Card from './Card';

interface CatalogProps {
  items: Item[];
}

export default function Catalog({ items }: CatalogProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map(item => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}