/**
 * Shared Types
 *
 * Common TypeScript interfaces and types used across
 * the application, admin panel, and API functions.
 */

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  status?: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
  updatedBy?: string;
  adminNotes?: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export interface CreateUserInput {
  email: string;
  name?: string;
}

export interface UpdateUserInput {
  name?: string;
  status?: UserStatus;
  notes?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  timestamp: string;
}

// ============================================
// Auth Types
// ============================================

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  authorized: boolean;
}

// ============================================
// Health Check Types
// ============================================

export interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
}

export interface AdminHealthCheck extends HealthCheck {
  allowedDomains: string[];
}
