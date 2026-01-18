<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { api, type Order, type OrderItem } from '../lib/api';

const route = useRoute();

const order = ref<Order | null>(null);
const items = ref<OrderItem[]>([]);
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
    hour: '2-digit',
    minute: '2-digit',
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

async function fetchOrder() {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id as string;
    const response = await api.getOrder(id);
    order.value = response.order;
    items.value = response.items;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch order';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOrder);
watch(() => route.params.id, fetchOrder);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <RouterLink to="/" class="hover:text-gray-700">Home</RouterLink>
        <span>/</span>
        <RouterLink to="/orders" class="hover:text-gray-700">Orders</RouterLink>
        <span>/</span>
        <span class="text-gray-900">{{ order?.id.substring(0, 8) || 'Loading...' }}...</span>
      </nav>

      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
        <RouterLink
          to="/orders"
          class="mt-2 inline-block text-red-700 hover:text-red-800 font-medium"
        >
          Back to orders
        </RouterLink>
      </div>

      <div v-else-if="order" class="space-y-6">
        <!-- Order Header -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Order Details</h1>
              <p class="mt-1 font-mono text-sm text-gray-500">{{ order.id }}</p>
            </div>
            <span
              :class="['px-3 py-1 text-sm font-medium rounded-full capitalize', getStatusColor(order.status)]"
            >
              {{ order.status }}
            </span>
          </div>

          <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-gray-500">Order Date</dt>
              <dd class="mt-1 font-medium text-gray-900">{{ formatDate(order.createdAt) }}</dd>
            </div>
            <div v-if="order.completedAt">
              <dt class="text-gray-500">Completed</dt>
              <dd class="mt-1 font-medium text-gray-900">{{ formatDate(order.completedAt) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Total</dt>
              <dd class="mt-1 font-medium text-gray-900">{{ formatPrice(order.totalAmount, order.currency) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Items</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="item in items"
              :key="item.id"
              class="p-6 flex gap-4"
            >
              <div class="flex-1">
                <RouterLink
                  :to="`/products/${item.productId}`"
                  class="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {{ item.productName }}
                </RouterLink>
                <p v-if="item.productDescription" class="mt-1 text-sm text-gray-500 line-clamp-1">
                  {{ item.productDescription }}
                </p>
                <p class="mt-2 text-sm text-gray-600">
                  {{ formatPrice(item.unitAmount, order.currency) }} x {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">
                  {{ formatPrice(item.unitAmount * item.quantity, order.currency) }}
                </p>
                <a
                  v-if="item.downloadUrl"
                  :href="item.downloadUrl"
                  target="_blank"
                  class="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between">
          <RouterLink
            to="/orders"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to orders
          </RouterLink>
          <RouterLink
            to="/products"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue shopping
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
