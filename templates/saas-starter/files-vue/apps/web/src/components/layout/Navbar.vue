<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

async function handleSignOut() {
  await authStore.signOut();
  router.push('/');
}
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <span class="text-xl font-bold text-gray-900">SaaS App</span>
          </RouterLink>
        </div>

        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <RouterLink
              to="/dashboard"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/billing"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Billing
            </RouterLink>
            <RouterLink
              to="/settings"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Settings
            </RouterLink>
            <button
              @click="handleSignOut"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign Out
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </RouterLink>
            <RouterLink
              to="/signup"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Get Started
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
