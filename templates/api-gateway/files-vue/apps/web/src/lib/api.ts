/**
 * API Client
 */

import { auth } from './firebase';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Types
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  plan: string;
  rateLimit: number;
  dailyLimit: number;
  status: string;
  description?: string;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface DailyUsage {
  id: number;
  apiKeyId: string;
  date: string;
  requestCount: number;
  errorCount: number;
  avgResponseTimeMs?: number;
}

export interface Plan {
  name: string;
  rateLimit: number;
  dailyLimit: number;
  maxKeys: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: string;
}

// API functions
export const api = {
  // Profile
  async getProfile(): Promise<{ user: User }> {
    return fetchApi('/admin/profile');
  },

  // API Keys
  async listKeys(): Promise<{ keys: ApiKey[] }> {
    return fetchApi('/admin/keys');
  },

  async createKey(name: string, description?: string): Promise<{ key: string; apiKey: ApiKey }> {
    return fetchApi('/admin/keys', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async revokeKey(keyId: string): Promise<{ message: string }> {
    return fetchApi(`/admin/keys/${keyId}`, {
      method: 'DELETE',
    });
  },

  async rotateKey(keyId: string): Promise<{ key: string; apiKey: ApiKey }> {
    return fetchApi(`/admin/keys/${keyId}/rotate`, {
      method: 'POST',
    });
  },

  // Usage
  async getUsage(days: number = 30, keyId?: string): Promise<{ usage: DailyUsage[]; summary: { totalRequests: number; totalErrors: number } }> {
    const params = new URLSearchParams({ days: String(days) });
    if (keyId) {
      params.append('keyId', keyId);
    }
    return fetchApi(`/admin/usage?${params}`);
  },

  // Plans
  async getPlans(): Promise<{ plans: Plan[] }> {
    return fetchApi('/admin/plans');
  },
};
