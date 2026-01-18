/**
 * Vue Router Configuration
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    name: 'chat',
    component: () => import('../pages/Chat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/c/:id',
    name: 'conversation',
    component: () => import('../pages/Chat.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Wait for auth to initialize
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = authStore.$subscribe((_, state) => {
        if (!state.loading) {
          unwatch();
          resolve();
        }
      });
    });
  }

  const isAuthenticated = !!authStore.user;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'chat' });
  } else {
    next();
  }
});

export default router;
