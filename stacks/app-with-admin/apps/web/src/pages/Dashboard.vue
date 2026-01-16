<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../services/auth';
import { getProfile } from '../services/api';

const { user } = useAuth();
const profile = ref<{ name?: string } | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    profile.value = await getProfile();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load profile';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else>
        <h2 class="text-lg font-semibold mb-4">Welcome, {{ user?.displayName || user?.email }}</h2>
        <p class="text-gray-600 dark:text-gray-400">
          This is your dashboard. Customize this page to show your app's main content.
        </p>
      </div>
    </div>
  </div>
</template>
