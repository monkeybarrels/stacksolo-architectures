/**
 * Firebase Auth Service
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
  isAuthenticated: ComputedRef<boolean>;
}

const user: Ref<AuthUser | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const error: Ref<string | null> = ref(null);

let unsubscribe: (() => void) | null = null;

function toAuthUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

export function initializeAuth(): void {
  if (unsubscribe) return;

  unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      user.value = toAuthUser(firebaseUser);
    } else {
      user.value = null;
    }
    loading.value = false;
  });
}

export async function signIn(): Promise<boolean> {
  try {
    loading.value = true;
    error.value = null;

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return true;
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
    isAuthenticated,
  };
}
