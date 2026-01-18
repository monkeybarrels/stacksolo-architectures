/**
 * Auth Store
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  function initialize() {
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
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in';
      throw e;
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign up';
      throw e;
    }
  }

  async function signInWithGoogle() {
    error.value = null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      user.value = result.user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in with Google';
      throw e;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    user.value = null;
  }

  return {
    user,
    loading,
    error,
    initialize,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
});
