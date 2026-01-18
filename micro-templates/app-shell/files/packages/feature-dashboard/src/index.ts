import type { RouteRecordRaw } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';

/**
 * Feature routes exported for shell registration.
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: {
      title: 'Dashboard',
      icon: 'home',
    },
  },
];

// Export components for potential use in other features
export { DashboardPage };
