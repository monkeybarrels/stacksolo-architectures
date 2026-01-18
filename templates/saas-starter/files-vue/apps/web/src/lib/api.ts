/**
 * API Client
 *
 * Wraps fetch with auth token handling.
 */

import { auth } from './firebase';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return {};

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// API methods
export const api = {
  // User
  getProfile: () => apiFetch<{ id: string; email: string; name?: string }>('/user/profile'),
  updateProfile: (data: { name?: string }) =>
    apiFetch('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Billing
  getPlans: () => apiFetch<Record<string, { name: string; priceId: string; features: string[] }>>('/billing/plans'),
  getSubscription: () => apiFetch<{ subscription: any }>('/billing/subscription'),
  createCheckout: (priceId: string) =>
    apiFetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),
  createPortal: () =>
    apiFetch<{ url: string }>('/billing/portal', { method: 'POST' }),
};
