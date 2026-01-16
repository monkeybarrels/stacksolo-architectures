/**
 * Admin Panel Router
 *
 * Uses import.meta.env.BASE_URL to sync with Vite's base config.
 */

import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/Users.vue'),
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('../pages/UserDetail.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  // IMPORTANT: Use BASE_URL from Vite config to avoid double-prefixing
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
