/**
 * API Service
 *
 * Authenticated API client for backend calls.
 */

import axios from 'axios';
import { getIdToken } from './auth';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Example API calls - customize for your app
export async function getProfile() {
  const response = await api.get('/profile');
  return response.data;
}

export async function updateProfile(data: { name?: string }) {
  const response = await api.put('/profile', data);
  return response.data;
}
