<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useApiKeysStore } from '../stores/apiKeys';
import DashboardLayout from '../components/DashboardLayout.vue';

const apiKeysStore = useApiKeysStore();

const selectedDays = ref(30);
const selectedKeyId = ref<string | undefined>(undefined);

onMounted(async () => {
  await Promise.all([
    apiKeysStore.loadKeys(),
    apiKeysStore.loadUsage(selectedDays.value),
  ]);
});

const activeKeys = computed(() => apiKeysStore.keys.filter(k => k.status === 'active'));

async function handleFilterChange() {
  await apiKeysStore.loadUsage(selectedDays.value, selectedKeyId.value);
}

// Simple chart data
const chartData = computed(() => {
  const usage = [...apiKeysStore.usage].reverse().slice(-selectedDays.value);
  const maxRequests = Math.max(...usage.map(u => u.requestCount), 1);

  return usage.map(day => ({
    date: day.date,
    requests: day.requestCount,
    errors: day.errorCount,
    height: (day.requestCount / maxRequests) * 100,
  }));
});
</script>

<template>
  <DashboardLayout>
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Usage Analytics</h1>
      <p class="mt-1 text-gray-500">Track your API usage over time</p>

      <!-- Filters -->
      <div class="mt-6 flex gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <select
            v-model="selectedDays"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option :value="7">Last 7 days</option>
            <option :value="30">Last 30 days</option>
            <option :value="90">Last 90 days</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <select
            v-model="selectedKeyId"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option :value="undefined">All Keys</option>
            <option v-for="key in activeKeys" :key="key.id" :value="key.id">
              {{ key.name }} ({{ key.keyPrefix }}...)
            </option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-sm text-gray-500">Total Requests</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ apiKeysStore.usageSummary.totalRequests.toLocaleString() }}
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-sm text-gray-500">Total Errors</div>
          <div class="text-2xl font-bold text-red-600">
            {{ apiKeysStore.usageSummary.totalErrors.toLocaleString() }}
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-sm text-gray-500">Success Rate</div>
          <div class="text-2xl font-bold text-green-600">
            {{
              apiKeysStore.usageSummary.totalRequests > 0
                ? (((apiKeysStore.usageSummary.totalRequests - apiKeysStore.usageSummary.totalErrors) / apiKeysStore.usageSummary.totalRequests) * 100).toFixed(1)
                : 0
            }}%
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-sm text-gray-500">Avg per Day</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ Math.round(apiKeysStore.usageSummary.totalRequests / selectedDays).toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Requests Over Time</h2>

        <div v-if="apiKeysStore.loading" class="h-64 flex items-center justify-center text-gray-500">
          Loading...
        </div>

        <div v-else-if="chartData.length === 0" class="h-64 flex items-center justify-center text-gray-500">
          No usage data for this period
        </div>

        <div v-else class="h-64 flex items-end gap-1">
          <div
            v-for="day in chartData"
            :key="day.date"
            class="flex-1 flex flex-col items-center justify-end group"
          >
            <!-- Bar -->
            <div
              class="w-full bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
              :style="{ height: day.height + '%', minHeight: day.requests > 0 ? '4px' : '0' }"
            ></div>

            <!-- Error portion -->
            <div
              v-if="day.errors > 0"
              class="w-full bg-red-500 rounded-t"
              :style="{ height: (day.errors / day.requests * day.height) + '%' }"
            ></div>

            <!-- Tooltip -->
            <div class="absolute -top-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {{ day.date }}<br>
              {{ day.requests.toLocaleString() }} requests
              <span v-if="day.errors > 0" class="text-red-300">({{ day.errors }} errors)</span>
            </div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span v-if="chartData.length > 0">{{ chartData[0]?.date }}</span>
          <span v-if="chartData.length > 0">{{ chartData[chartData.length - 1]?.date }}</span>
        </div>
      </div>

      <!-- Daily Table -->
      <div class="mt-8 bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Daily Breakdown</h2>
        </div>

        <div v-if="apiKeysStore.loading" class="p-8 text-center text-gray-500">
          Loading...
        </div>

        <div v-else-if="apiKeysStore.usage.length === 0" class="p-8 text-center text-gray-500">
          No usage data for this period
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="day in apiKeysStore.usage" :key="day.date" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ day.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ day.requestCount.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ day.errorCount }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="day.errorCount > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ day.requestCount > 0 ? ((day.errorCount / day.requestCount) * 100).toFixed(1) : 0 }}%
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ day.avgResponseTimeMs || '-' }}ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>
