/**
 * Vue Router Configuration
 *
 * Sets up routes with navigation guards for auth.
 */

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from './composables/useAuth';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import Dashboard from './components/Dashboard.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const { user, loading } = useAuth();

  // Wait for auth to initialize
  if (loading.value) {
    const unwatch = setInterval(() => {
      if (!loading.value) {
        clearInterval(unwatch);
        checkAuth();
      }
    }, 50);
    return;
  }

  checkAuth();

  function checkAuth() {
    if (to.meta.requiresAuth && !user.value) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.meta.requiresGuest && user.value) {
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  }
});

export default router;
