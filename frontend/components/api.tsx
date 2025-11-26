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
    create: async (data: CreatePostData): Promise<Post> => {
      return authenticatedRequest<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Claim post
    claim: async (postId: string): Promise<Post> => {
      return authenticatedRequest<Post>(`/posts/${postId}/claim`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
    },

    // Delete post
    delete: async (postId: string): Promise<void> => {
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
      return authenticatedRequest<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Delete review
    delete: async (reviewId: string): Promise<void> => {
      return authenticatedRequest<void>(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },
  };
}