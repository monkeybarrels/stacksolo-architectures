/**
 * Firebase Auth Service for Admin Panel
 *
 * Provides authentication with domain restriction.
 * Users must be from allowed domains to access admin features.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: Ref<AuthUser | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  authorized: Ref<boolean>;
  isAuthenticated: ComputedRef<boolean>;
}

const user: Ref<AuthUser | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const error: Ref<string | null> = ref(null);
const authorized: Ref<boolean> = ref(false);

let unsubscribe: (() => void) | null = null;

function toAuthUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

/**
 * Check if the current user is authorized (valid token + allowed domain)
 */
async function checkAuthorization(): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    authorized.value = false;
    return false;
  }

  try {
    const token = await currentUser.getIdToken();
    const response = await axios.get('/admin-api/auth/check', {
      headers: { Authorization: `Bearer ${token}` },
    });
    authorized.value = response.data.data?.authorized === true;
    return authorized.value;
  } catch (e) {
    console.error('Authorization check failed:', e);
    authorized.value = false;

    // Extract error message for display
    if (axios.isAxiosError(e) && e.response?.data?.code === 'DOMAIN_NOT_ALLOWED') {
      error.value = e.response.data.error;
    }

    return false;
  }
}

export function initializeAuth(): void {
  if (unsubscribe) return;

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    loading.value = true;
    error.value = null;

    if (firebaseUser) {
      user.value = toAuthUser(firebaseUser);
      await checkAuthorization();
    } else {
      user.value = null;
      authorized.value = false;
    }

    loading.value = false;
  });
}

export async function signIn(): Promise<boolean> {
  try {
    loading.value = true;
    error.value = null;

    const provider = new GoogleAuthProvider();
    provider.addScope('email');

    await signInWithPopup(auth, provider);

    const isAuthorized = await checkAuthorization();

    if (!isAuthorized && user.value?.email) {
      const domain = user.value.email.split('@')[1];
      error.value = `Access denied. Your domain (${domain}) is not authorized.`;
    }

    return isAuthorized;
  } catch (e) {
    console.error('Sign in failed:', e);
    error.value = e instanceof Error ? e.message : 'Sign in failed';
    return false;
  } finally {
    loading.value = false;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    user.value = null;
    authorized.value = false;
    error.value = null;
  } catch (e) {
    console.error('Sign out failed:', e);
  }
}

export async function getIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const isAuthenticated = computed(() => !!user.value);

  // Initialize on first use
  initializeAuth();

  return {
    user,
    loading,
    error,
    authorized,
    isAuthenticated,
  };
}

/**
 * Create an API client that includes Firebase auth token
 */
export function createAuthenticatedApiClient(baseURL = '/admin-api') {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(async (config) => {
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}
