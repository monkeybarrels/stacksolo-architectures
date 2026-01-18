import { create } from 'zustand';

interface DashboardStats {
  users: number;
  revenue: number;
  orders: number;
  sessions: number;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    users: 0,
    revenue: 0,
    orders: 0,
    sessions: 0,
  },
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data - replace with actual API call
      set({
        stats: {
          users: 1234,
          revenue: 45678,
          orders: 89,
          sessions: 456,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        loading: false,
      });
    }
  },
}));
