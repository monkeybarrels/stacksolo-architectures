<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Product } from '../lib/api';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();
const authStore = useAuthStore();

const imageUrl = computed(() => {
  return props.product.images[0] || 'https://via.placeholder.com/400x400?text=No+Image';
});

const formattedPrice = computed(() => {
  if (!props.product.price) return 'Price unavailable';
  const amount = props.product.price.unitAmount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price.currency,
  }).format(amount);
});

const isAuthenticated = computed(() => !!authStore.user);

async function addToCart() {
  if (!props.product.price) return;
  await cartStore.addItem(props.product);
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <RouterLink :to="`/products/${product.id}`" class="block">
      <div class="aspect-square bg-gray-100">
        <img
          :src="imageUrl"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>
    </RouterLink>
    <div class="p-4">
      <RouterLink :to="`/products/${product.id}`">
        <h3 class="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          {{ product.name }}
        </h3>
      </RouterLink>
      <p v-if="product.description" class="mt-1 text-sm text-gray-500 line-clamp-2">
        {{ product.description }}
      </p>
      <div class="mt-3 flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">{{ formattedPrice }}</span>
        <button
          v-if="product.price && isAuthenticated"
          @click="addToCart"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add to Cart
        </button>
        <RouterLink
          v-else-if="!isAuthenticated"
          to="/login"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign in to buy
        </RouterLink>
      </div>
    </div>
  </div>
</template>
