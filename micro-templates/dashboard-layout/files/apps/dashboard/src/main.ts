import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

import DashboardLayout from './layouts/DashboardLayout.vue';

// Example pages - replace with your own
const Dashboard = { template: '<div class="p-6"><h1 class="text-2xl font-bold">Dashboard</h1><p class="mt-2 text-gray-600">Welcome to your dashboard.</p></div>' };
const Analytics = { template: '<div class="p-6"><h1 class="text-2xl font-bold">Analytics</h1><p class="mt-2 text-gray-600">Your analytics data.</p></div>' };
const Settings = { template: '<div class="p-6"><h1 class="text-2xl font-bold">Settings</h1><p class="mt-2 text-gray-600">Manage your settings.</p></div>' };

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: Dashboard },
        { path: 'analytics', component: Analytics },
        { path: 'settings', component: Settings },
      ],
    },
  ],
});

createApp(App).use(router).mount('#app');
