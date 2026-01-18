<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSubscriptionStore } from '../stores/subscription';
import { api } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout.vue';

const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();

const userName = computed(() => authStore.userName);
const userEmail = computed(() => authStore.userEmail);
const isSubscribed = computed(() => subscriptionStore.isSubscribed);
const currentPlan = computed(() => subscriptionStore.currentPlan || 'Free');

const profile = ref<{ id: string; email: string; name?: string } | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    await subscriptionStore.fetchSubscription();
    profile.value = await api.getProfile();
  } catch (e) {
    // Profile fetch may fail if user hasn't synced yet
    console.error('Failed to fetch profile:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <DashboardLayout>
    <div class="max-w-4xl">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-gray-500">Welcome back, {{ userName || userEmail }}!</p>

      <div v-if="loading" class="mt-8">
        <div class="animate-pulse space-y-4">
          <div class="h-32 bg-gray-200 rounded-lg"></div>
          <div class="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-6">
        <!-- Account Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900">Account Status</h2>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Current Plan</p>
              <p class="text-lg font-medium text-gray-900">{{ currentPlan }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span
                :class="[
                  isSubscribed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium',
                ]"
              >
                {{ isSubscribed ? 'Active' : 'Free' }}
              </span>
            </div>
          </div>
          <div v-if="!isSubscribed" class="mt-4">
            <RouterLink
              to="/billing"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Upgrade to Pro &rarr;
            </RouterLink>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900">Quick Stats</h2>
          <p class="mt-2 text-sm text-gray-500">
            This is where you'd show your app-specific metrics.
          </p>
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Projects</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Tasks</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        <!-- Getting Started -->
        <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 class="text-lg font-semibold text-blue-900">Getting Started</h2>
          <p class="mt-2 text-sm text-blue-700">
            This is a starter template. Customize this dashboard to show your app's
            features and data.
          </p>
          <div class="mt-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
              <span class="text-sm text-blue-800">Set up your Stripe products and prices</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              <span class="text-sm text-blue-800">Configure your Firebase project</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
              <span class="text-sm text-blue-800">Build your custom features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
