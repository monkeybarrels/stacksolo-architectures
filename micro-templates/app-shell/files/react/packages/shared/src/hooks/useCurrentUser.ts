import { useAuthStore } from '@{{org}}/shell/core/stores';

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    displayName: user?.displayName || user?.email || 'User',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
  };
}
