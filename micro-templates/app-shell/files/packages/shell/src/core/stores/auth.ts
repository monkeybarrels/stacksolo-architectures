import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
  const userAvatar = computed(() => user.value?.photoURL);

  // Initialize auth state listener
  function init() {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser;
        loading.value = false;
        resolve();
      });
    });
  }

  async function signInWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user.value = result.user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sign in failed';
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
      error.value = e instanceof Error ? e.message : 'Google sign in failed';
      throw e;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      user.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sign out failed';
      throw e;
    }
  }

  async function getIdToken(): Promise<string | null> {
    if (!user.value) return null;
    return user.value.getIdToken();
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    userName,
    userAvatar,
    init,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    getIdToken,
  };
});
