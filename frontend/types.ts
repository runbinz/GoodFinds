// Type definitions for GoodFinds

export interface Review {
  id: string;
  reviewer_id: string;
  poster_id: string;
  post_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  reputation: number;
  review_count: number;
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
  status: 'available' | 'claimed' | 'removed';
  claimed_by?: string | null;
}

export const categories = [
  'All',
  'Furniture',
  'Electronics',
  'Clothing',
  'Books',
  'Other'
];