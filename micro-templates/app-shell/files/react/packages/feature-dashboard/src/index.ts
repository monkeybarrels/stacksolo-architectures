import type { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/dashboard',
    lazy: async () => {
      const { DashboardPage } = await import('./pages/DashboardPage');
      return { Component: DashboardPage };
    },
  },
  {
    path: '/',
    lazy: async () => {
      const { DashboardPage } = await import('./pages/DashboardPage');
      return { Component: DashboardPage };
    },
  },
];

// Feature metadata for sidebar
export const meta = {
  title: 'Dashboard',
  icon: 'home',
  order: 0,
};

export { DashboardPage } from './pages/DashboardPage';
export { StatsCard } from './components/StatsCard';
export { useDashboardStore } from './stores/dashboard';
