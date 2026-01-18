<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { api, type Order } from '../lib/api';

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

async function fetchOrders() {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.listOrders();
    orders.value = response.orders;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch orders';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOrders);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="fetchOrders"
          class="mt-2 text-red-700 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
        <p class="mt-2 text-gray-500">When you make a purchase, your orders will appear here.</p>
        <RouterLink
          to="/products"
          class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Products
        </RouterLink>
      </div>

      <div v-else class="space-y-4">
        <RouterLink
          v-for="order in orders"
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-sm text-gray-500">{{ order.id.substring(0, 8) }}...</span>
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full capitalize', getStatusColor(order.status)]"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="mt-2 text-gray-600">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">
                {{ formatPrice(order.totalAmount, order.currency) }}
              </p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
