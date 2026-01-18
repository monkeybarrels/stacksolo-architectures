import { create } from 'zustand';

interface NavItem {
  path: string;
  title: string;
  icon?: string;
}

interface ShellState {
  sidebarOpen: boolean;
  navItems: NavItem[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNavItems: (items: NavItem[]) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  sidebarOpen: true,
  navItems: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNavItems: (items) => set({ navItems: items }),
}));
