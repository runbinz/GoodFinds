export interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
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
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, rating: 4.5 },
  { id: 2, name: 'Coffee Beans', category: 'Food', price: 24.99, rating: 4.8 },
  { id: 3, name: 'Yoga Mat', category: 'Sports', price: 34.99, rating: 4.3 },
  { id: 4, name: 'Knife Set', category: 'Home', price: 89.99, rating: 4.7 },
  { id: 5, name: 'Running Shoes', category: 'Sports', price: 119.99, rating: 4.6 },
  { id: 6, name: 'Smart Watch', category: 'Electronics', price: 199.99, rating: 4.4 },
];

export const categories = ['All', 'Electronics', 'Food', 'Sports', 'Home'];