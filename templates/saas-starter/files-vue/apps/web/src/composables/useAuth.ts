/**
 * useAuth Composable
 *
 * Convenience wrapper around the auth store for use in components.
 */

import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const store = useAuthStore();

  return {
    // State
    user: computed(() => store.user),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Getters
    isAuthenticated: computed(() => store.isAuthenticated),
    userEmail: computed(() => store.userEmail),
    userName: computed(() => store.userName),
    userPhoto: computed(() => store.userPhoto),

    // Actions
    signInWithEmail: store.signInWithEmail,
    signUpWithEmail: store.signUpWithEmail,
    signInWithGoogle: store.signInWithGoogle,
    signOut: store.signOut,
    clearError: store.clearError,
  };
}
