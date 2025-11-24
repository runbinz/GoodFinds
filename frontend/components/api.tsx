// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Item {
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

export interface Review {
  id: string;
  reviewer_id: string;
  poster_id: string;
  item_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  reputation: number;
  reviews: number;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Posts API
export const postsAPI = {
  // Get all posts
  getAll: async (category?: string, status?: string): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Item[]>(`/posts${query}`);
  },

  // Get single post
  getById: async (id: string): Promise<Item> => {
    return apiCall<Item>(`/posts/${id}`);
  },

  // Create post
  create: async (data: {
    user_id: string;
    item_title: string;
    description?: string;
    images?: string[];
    category?: string;
    condition: string;
    location: string;
  }): Promise<Item> => {
    return apiCall<Item>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Claim post
  claim: async (postId: string, userId: string): Promise<Item> => {
    return apiCall<Item>(`/posts/${postId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Delete post
  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reviews API
export const reviewsAPI = {
  // Get all reviews with filters
  getAll: async (filters?: {
    reviewer_id?: string;
    poster_id?: string;
    item_id?: string;
  }): Promise<Review[]> => {
    const params = new URLSearchParams();
    if (filters?.reviewer_id) params.append('reviewer_id', filters.reviewer_id);
    if (filters?.poster_id) params.append('poster_id', filters.poster_id);
    if (filters?.item_id) params.append('item_id', filters.item_id);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<Review[]>(`/reviews${query}`);
  },

  // Get single review
  getById: async (id: string): Promise<Review> => {
    return apiCall<Review>(`/reviews/${id}`);
  },

  // Create review
  create: async (data: {
    reviewer_id: string;
    poster_id: string;
    item_id: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    return apiCall<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return apiCall<User[]>('/users');
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    return apiCall<User>(`/users/${id}`);
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User> => {
    return apiCall<User>(`/users/email/${email}`);
  },
};

// Auth API
export const authAPI = {
  // Register
  register: async (data: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ message: string }> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: { username: string; email: string } }> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};