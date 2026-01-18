/**
 * Auth Store
 *
 * Pinia store for Firebase authentication state.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email);
  const userName = computed(() => user.value?.displayName);
  const userPhoto = computed(() => user.value?.photoURL);

  // Initialize auth state listener
  function init() {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;
    });
  }

  async function signInWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e: any) {
      error.value = e.message || 'Sign in failed';
      throw e;
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e: any) {
      error.value = e.message || 'Sign up failed';
      throw e;
    }
  }

  async function signInWithGoogle() {
    error.value = null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      user.value = result.user;
    } catch (e: any) {
      error.value = e.message || 'Google sign in failed';
      throw e;
    }
  }

  async function signOut() {
    error.value = null;
    try {
      await firebaseSignOut(auth);
      user.value = null;
    } catch (e: any) {
      error.value = e.message || 'Sign out failed';
      throw e;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    userEmail,
    userName,
    userPhoto,

    // Actions
    init,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    clearError,
  };
});
