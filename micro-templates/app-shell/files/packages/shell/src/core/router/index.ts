import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useShellStore } from '../stores/shell';
import ShellLayout from '../layouts/ShellLayout.vue';
import Login from '@/pages/Login.vue';

// Import feature routes
import { routes as dashboardRoutes } from '@{{org}}/feature-dashboard';

// Collect all feature routes
const featureRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  // New features are added here by `stacksolo add feature-module`
];

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: ShellLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      ...featureRoutes,
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore();

  // Wait for auth to initialize
  if (authStore.loading) {
    await authStore.init();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false);

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { path: '/' };
  }

  return true;
});

// Register nav items from feature routes
router.isReady().then(() => {
  const shellStore = useShellStore();

  featureRoutes.forEach((route) => {
    if (route.meta?.title) {
      shellStore.registerNavItem({
        name: route.meta.title as string,
        path: route.path as string,
        icon: (route.meta.icon as string) || 'circle',
      });
    }
  });
});

export default router;
