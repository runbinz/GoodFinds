import { publicRequest, useAuthenticatedAPI } from '@/lib/api';
import { Post, Review, User } from '@/types';

// Types for API requests
export interface CreatePostData {
  item_title: string;
  description?: string;
  images?: string[];
  category?: string;
  condition: string;
  location: string;
}

export interface CreateReviewData {
  poster_id: string;
  post_id: string;
  rating: number;
  comment?: string;
}

// Public API endpoints
export const publicPostsAPI = {
  // Get all posts
  getAll: async (params?: { category?: string; status?: string; location?: string; condition?: string }): Promise<Post[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.condition) searchParams.append('condition', params.condition);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return publicRequest<Post[]>(`/posts${query}`);
  },

  // Get single post
  getById: async (id: string): Promise<Post> => {
    return publicRequest<Post>(`/posts/${id}`);
  },
};

export const publicReviewsAPI = {
  // Get review by ID
  getById: async (id: string): Promise<Review> => {
    return publicRequest<Review>(`/reviews/${id}`);
  },

  // Get reviews for a poster
  getByPosterId: async (posterId: string): Promise<Review[]> => {
    return publicRequest<Review[]>(`/reviews/poster/${posterId}`);
  },
};

export const publicUsersAPI = {
  // Get user reputation
  getReputation: async (userId: string): Promise<User> => {
    return publicRequest<User>(`/users/${userId}/reputation`);
  },
};

// Authenticated API endpoints
// Custom hook that provides authenticated API functions
export function useAuthenticatedPosts() {
  const { authenticatedRequest } = useAuthenticatedAPI();

  return {
    // Create post
    create: async (data: CreatePostData & { user_id: string }): Promise<Post> => {
      // Send POST request to create a new post with the user_id included
      return authenticatedRequest<Post>('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },

    // Claim post
    claim: async (postId: string, userId: string): Promise<Post> => {
      // Send POST request to /posts/{post_id}/claim endpoint with user_id
      // Must be POST since backend defines @router.post("/{post_id}/claim")
      return authenticatedRequest<Post>(`/posts/${postId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
    },

    // Delete post
    delete: async (postId: string): Promise<void> => {
      // Send DELETE request to remove a specific post by ID
      return authenticatedRequest<void>(`/posts/${postId}`, {
        method: 'DELETE',
      });
    },
  };
}

export function useAuthenticatedReviews() {
  const { authenticatedRequest } = useAuthenticatedAPI();

  return {
    // Create review
    create: async (data: CreateReviewData): Promise<Review> => {
      // Send POST request to create a new review for a claimed post
      return authenticatedRequest<Review>('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },

    // Delete review
    delete: async (reviewId: string): Promise<void> => {
      // Send DELETE request to remove a review by ID
      return authenticatedRequest<void>(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },
  };
}
