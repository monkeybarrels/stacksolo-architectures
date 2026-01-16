<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStats } from '../services/api';

const stats = ref<{ totalUsers: number; recentUsers: number } | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    stats.value = await getStats();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load stats';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

    <div v-if="loading" class="text-gray-600 dark:text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-center">
            <div class="text-4xl font-bold text-primary">{{ stats?.totalUsers || 0 }}</div>
            <div class="text-gray-600 dark:text-gray-400 mt-2">Total Users</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-center">
            <div class="text-4xl font-bold text-primary">{{ stats?.recentUsers || 0 }}</div>
            <div class="text-gray-600 dark:text-gray-400 mt-2">Recent Users (7 days)</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
