import { create } from 'zustand';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationState {
  items: Notification[];
  show: (message: string, type?: Notification['type']) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],

  show: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      items: [...state.items, { id, message, type }],
    }));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    }, 5000);
  },

  dismiss: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clear: () => {
    set({ items: [] });
  },
}));
