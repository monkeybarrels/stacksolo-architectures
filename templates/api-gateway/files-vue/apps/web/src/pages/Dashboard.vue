<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useApiKeysStore } from '../stores/apiKeys';
import DashboardLayout from '../components/DashboardLayout.vue';

const apiKeysStore = useApiKeysStore();

onMounted(async () => {
  await Promise.all([
    apiKeysStore.loadKeys(),
    apiKeysStore.loadUsage(7),
  ]);
});

const activeKeys = computed(() => apiKeysStore.keys.filter(k => k.status === 'active').length);
const totalRequests = computed(() => apiKeysStore.usageSummary.totalRequests);
const errorRate = computed(() => {
  if (totalRequests.value === 0) return 0;
  return ((apiKeysStore.usageSummary.totalErrors / totalRequests.value) * 100).toFixed(1);
});
</script>

<template>
  <DashboardLayout>
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-gray-500">Overview of your API usage</p>

      <!-- Stats Cards -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-500">Active API Keys</div>
              <div class="text-2xl font-bold text-gray-900">{{ activeKeys }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-500">Requests (7 days)</div>
              <div class="text-2xl font-bold text-gray-900">{{ totalRequests.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-500">Error Rate</div>
              <div class="text-2xl font-bold text-gray-900">{{ errorRate }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <router-link
            to="/keys"
            class="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Create API Key</div>
              <div class="text-sm text-gray-500">Generate a new key for your application</div>
            </div>
          </router-link>

          <router-link
            to="/docs"
            class="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">View Documentation</div>
              <div class="text-sm text-gray-500">Learn how to integrate the API</div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Usage</h2>
        <div class="bg-white rounded-lg border border-gray-200">
          <div v-if="apiKeysStore.loading" class="p-8 text-center text-gray-500">
            Loading...
          </div>
          <div v-else-if="apiKeysStore.usage.length === 0" class="p-8 text-center text-gray-500">
            No usage data yet. Start making API calls to see your usage.
          </div>
          <table v-else class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="day in apiKeysStore.usage.slice(0, 7)" :key="day.date">
                <td class="px-6 py-4 text-sm text-gray-900">{{ day.date }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ day.requestCount.toLocaleString() }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ day.errorCount }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ day.avgResponseTimeMs || '-' }}ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
