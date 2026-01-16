/**
 * Admin API Service
 *
 * Uses Firebase Auth with domain restriction.
 */

import { createAuthenticatedApiClient } from './auth';

const api = createAuthenticatedApiClient('/admin-api');

export default api;

// Type definitions
export interface User {
  id: string;
  email?: string;
  name?: string;
  status?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export interface StatsResponse {
  totalUsers: number;
  activeUsers: number;
  timestamp: string;
}

// Admin API client object
export const adminApi = {
  // Get all users with pagination
  async getUsers(limit = 50, offset = 0): Promise<UsersResponse> {
    const response = await api.get(`/users?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  // Get single user
  async getUser(id: string): Promise<{ data: User }> {
    const response = await api.get(`/users/${id}`);
    return { data: response.data.data };
  },

  // Update user
  async updateUser(id: string, data: { name?: string; status?: string; notes?: string }): Promise<{ data: User }> {
    const response = await api.put(`/users/${id}`, data);
    return { data: response.data.data };
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Get dashboard stats
  async getStats(): Promise<StatsResponse> {
    const response = await api.get('/stats');
    return response.data.data;
  },
};

// Legacy function exports for backwards compatibility
export async function getUsers(limit = 50): Promise<User[]> {
  const response = await adminApi.getUsers(limit);
  return response.users;
}

export async function getUser(id: string): Promise<User> {
  const response = await adminApi.getUser(id);
  return response.data;
}

export async function getStats(): Promise<StatsResponse> {
  return adminApi.getStats();
}
