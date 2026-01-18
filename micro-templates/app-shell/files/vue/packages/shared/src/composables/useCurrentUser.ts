import { computed, type ComputedRef } from 'vue';
import type { User } from '../types';

/**
 * Hook to access current user information.
 * Designed to work with the shell's auth store.
 *
 * Usage in feature packages:
 * ```typescript
 * import { useCurrentUser } from '@myorg/shared';
 *
 * const { user, isAuthenticated, userEmail } = useCurrentUser();
 * ```
 *
 * Note: This composable expects a Pinia store named 'auth' to be registered
 * by the shell. Features should not depend on internal auth implementation.
 */
export function useCurrentUser(): {
  user: ComputedRef<User | null>;
  isAuthenticated: ComputedRef<boolean>;
  userEmail: ComputedRef<string | null>;
  userName: ComputedRef<string | null>;
  userAvatar: ComputedRef<string | null>;
} {
  // Access the auth store through Pinia's global store
  // This allows features to use auth without importing shell internals
  let authStore: any = null;

  try {
    // Dynamic import to avoid circular dependencies
    const pinia = (window as any).__pinia__;
    if (pinia) {
      authStore = pinia._s.get('auth');
    }
  } catch {
    // Store not available yet
  }

  const user = computed<User | null>(() => {
    if (!authStore) return null;
    const u = authStore.user;
    if (!u) return null;
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
    };
  });

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email ?? null);
  const userName = computed(() => user.value?.displayName ?? null);
  const userAvatar = computed(() => user.value?.photoURL ?? null);

  return {
    user,
    isAuthenticated,
    userEmail,
    userName,
    userAvatar,
  };
}
