export interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  images?: string[];
  claimed?: boolean;
}

export interface Review {
  id: number;
  itemName: string;
  rating: number;
  comment: string;
  date: string;
}

export type Page = 'home' | 'catalog' | 'profile';

export const items: Item[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99},
  { id: 2, name: 'Coffee Beans', category: 'Home', price: 24.99},
  { id: 3, name: 'Yoga Mat', category: 'Sports', price: 34.99},
  { id: 4, name: 'Knife Set', category: 'Home', price: 89.99},
  { id: 5, name: 'Running Shoes', category: 'Sports', price: 119.99},
  { id: 6, name: 'Smart Watch', category: 'Electronics', price: 199.99},
];

export const categories = ['All', 'Electronics', 'Sports', 'Home'];