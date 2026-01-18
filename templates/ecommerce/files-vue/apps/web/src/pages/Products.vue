<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import ProductCard from '../components/ProductCard.vue';
import { useProductsStore } from '../stores/products';

const productsStore = useProductsStore();

onMounted(() => {
  productsStore.fetchProducts();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">All Products</h1>
        <p class="mt-2 text-gray-500">Browse our complete product catalog.</p>
      </div>

      <div v-if="productsStore.loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="productsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ productsStore.error }}</p>
        <button
          @click="productsStore.fetchProducts"
          class="mt-2 text-red-700 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>

      <div
        v-else-if="productsStore.products.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in productsStore.products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="text-center py-16">
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No products yet</h3>
        <p class="mt-2 text-gray-500">Add products in your Stripe dashboard to get started.</p>
      </div>
    </div>
  </div>
</template>
