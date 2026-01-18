import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Listen to auth state changes
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    error: null,

    signInWithEmail: async (email: string, password: string) => {
      set({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    signOut: async () => {
      await firebaseSignOut(auth);
    },

    clearError: () => set({ error: null }),
  };
});
