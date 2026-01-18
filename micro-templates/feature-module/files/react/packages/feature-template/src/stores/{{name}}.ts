import { create } from 'zustand';

interface {{Name}}Item {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

interface {{Name}}State {
  items: {{Name}}Item[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<{{Name}}Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<{{Name}}Item>) => void;
  deleteItem: (id: string) => void;
}

export const use{{Name}}Store = create<{{Name}}State>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data
      set({
        items: [
          {
            id: '1',
            title: 'Sample Item 1',
            description: 'This is a sample {{name}} item.',
            status: 'active',
            createdAt: new Date(),
          },
          {
            id: '2',
            title: 'Sample Item 2',
            description: 'Another {{name}} item for demonstration.',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch items',
        loading: false,
      });
    }
  },

  addItem: (item) => {
    const newItem: {{Name}}Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
