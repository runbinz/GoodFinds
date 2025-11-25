import { useAuth } from '@clerk/nextjs';
/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Public API requests without authentication
export async function publicRequest<T = any>(
  endpoint:string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: response.statusText 
    }));
    throw new Error(error.detail || 'API Request failed');
  }
  return response.json();
}

// Custom hook for authenticated API requests
export function useAuthenticatedAPI() {
  const { getToken } = useAuth();
  
  async function authenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,  // ← Auth token added here
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText
      }));
      throw new Error(error.detail || 'API request failed');
    }
    
    return response.json();
  } 
  return { authenticatedRequest };
}
