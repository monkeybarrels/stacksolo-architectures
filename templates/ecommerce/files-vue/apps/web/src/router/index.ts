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
    name: 'home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../pages/Products.vue'),
  },
  {
    path: '/products/:id',
    name: 'product',
    component: () => import('../pages/Product.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/Cart.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../pages/Orders.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'order',
    component: () => import('../pages/Order.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('../pages/CheckoutSuccess.vue'),
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
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
