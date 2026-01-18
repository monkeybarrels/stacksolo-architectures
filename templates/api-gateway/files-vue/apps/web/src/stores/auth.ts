/**
 * Auth Store
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

  function initialize() {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
        loading.value = false;
        resolve();
      });
    });
  }

  async function signIn(email: string, password: string) {
    error.value = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function signUp(email: string, password: string) {
    error.value = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e: any) {
      error.value = e.message;
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
      error.value = e.message;
      throw e;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      user.value = null;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    initialize,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
});
