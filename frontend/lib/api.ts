import { useAuth } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAPI() {
  const { getToken } = useAuth();

  async function apiRequest<T = any>(
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
        'Authorization': `Bearer ${token}`,
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

  async function apiRequestPublic<T = any>(
    endpoint: string,
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
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  return { apiRequest, apiRequestPublic };
}

export async function publicAPIRequest<T = any>(
  endpoint: string,
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
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

