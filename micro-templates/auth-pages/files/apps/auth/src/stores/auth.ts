import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  // Listen for auth state changes
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    loading.value = false;
  });

  async function signInWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user.value = result.user;
      return result.user;
    } catch (e: unknown) {
      error.value = getErrorMessage(e);
      throw e;
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    error.value = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      user.value = result.user;
      return result.user;
    } catch (e: unknown) {
      error.value = getErrorMessage(e);
      throw e;
    }
  }

  async function signInWithGoogle() {
    error.value = null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      user.value = result.user;
      return result.user;
    } catch (e: unknown) {
      error.value = getErrorMessage(e);
      throw e;
    }
  }

  async function logout() {
    await signOut(auth);
    user.value = null;
  }

  function getErrorMessage(e: unknown): string {
    if (typeof e === 'object' && e !== null && 'code' in e) {
      const code = (e as { code: string }).code;
      switch (code) {
        case 'auth/invalid-email':
          return 'Invalid email address';
        case 'auth/user-disabled':
          return 'This account has been disabled';
        case 'auth/user-not-found':
          return 'No account found with this email';
        case 'auth/wrong-password':
          return 'Incorrect password';
        case 'auth/email-already-in-use':
          return 'An account already exists with this email';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters';
        case 'auth/popup-closed-by-user':
          return 'Sign-in popup was closed';
        default:
          return 'An error occurred. Please try again.';
      }
    }
    return 'An error occurred. Please try again.';
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
  };
});
