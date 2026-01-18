<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useSubscriptionStore } from '../../stores/subscription';

const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();
const route = useRoute();

const userEmail = computed(() => authStore.userEmail);
const userName = computed(() => authStore.userName);
const userPhoto = computed(() => authStore.userPhoto);
const currentPlan = computed(() => subscriptionStore.currentPlan || 'Free');

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
  { name: 'Billing', href: '/billing', icon: 'credit-card' },
];

function isActive(href: string) {
  return route.path === href;
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center h-16 px-6 border-b border-gray-200">
          <RouterLink to="/" class="text-xl font-bold text-gray-900">
            SaaS App
          </RouterLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              isActive(item.href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            ]"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- User info -->
        <div class="border-t border-gray-200 p-4">
          <div class="flex items-center">
            <div
              v-if="userPhoto"
              class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"
            >
              <img :src="userPhoto" :alt="userName || 'User'" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
            >
              {{ (userName || userEmail || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ userName || userEmail }}
              </p>
              <p class="text-xs text-gray-500">
                {{ currentPlan }} plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="pl-64">
      <main class="py-8 px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
