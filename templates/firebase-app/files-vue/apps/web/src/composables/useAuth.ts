/**
 * Auth Composable
 *
 * Provides Firebase Auth state and methods using Vue's Composition API.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';

const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

let unsubscribe: (() => void) | null = null;

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);

  const initAuth = () => {
    if (unsubscribe) return;

    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;
    });
  };

  const signIn = async (email: string, password: string) => {
    error.value = null;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in';
      throw e;
    }
  };

  const signUp = async (email: string, password: string) => {
    error.value = null;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create account';
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    error.value = null;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in with Google';
      throw e;
    }
  };

  const signOut = async () => {
    error.value = null;
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign out';
      throw e;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user.value) return null;
    return user.value.getIdToken();
  };

  // Initialize on first use
  onMounted(() => {
    initAuth();
  });

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getIdToken,
    initAuth,
  };
}
