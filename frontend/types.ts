// Type definitions for GoodFinds

export interface Item {
  id: string;
  name: string;
  category: string;
  description?: string;
  images?: string[];
  condition?: string;
  location?: string;
  claimed: boolean;
  ownerId: string;
  claimedBy?: string;
}

export interface Review {
  id: string;
  itemName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  reputation: number;
  reviews: number;
}

export interface Post {
  id: string;
  item_title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  images: string[];
  category?: string;
  condition: string;
  location: string;
  claimed_by?: string;
  status: string;
}

export const categories = [
  'All',
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Toys',
  'Sports',
  'Other'
];