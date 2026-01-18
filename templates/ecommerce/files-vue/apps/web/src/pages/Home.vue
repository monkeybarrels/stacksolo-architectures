<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import ProductCard from '../components/ProductCard.vue';
import { useProductsStore } from '../stores/products';

const productsStore = useProductsStore();

onMounted(() => {
  if (!productsStore.hasProducts) {
    productsStore.fetchProducts();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <!-- Hero -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="max-w-2xl">
          <h1 class="text-4xl sm:text-5xl font-bold leading-tight">
            Welcome to our Store
          </h1>
          <p class="mt-4 text-xl text-blue-100">
            Discover amazing products at great prices. Shop now and enjoy fast delivery.
          </p>
          <div class="mt-8 flex gap-4">
            <RouterLink
              to="/products"
              class="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Products -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Featured Products</h2>
        <RouterLink
          to="/products"
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
        </RouterLink>
      </div>

      <div v-if="productsStore.loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div
        v-else-if="productsStore.products.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in productsStore.products.slice(0, 4)"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">No products available yet.</p>
      </div>
    </div>

    <!-- Features -->
    <div class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Quality Products</h3>
            <p class="mt-2 text-gray-500">Carefully curated selection of premium items.</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Fast Delivery</h3>
            <p class="mt-2 text-gray-500">Quick shipping to get your items faster.</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Secure Payments</h3>
            <p class="mt-2 text-gray-500">Safe and secure checkout with Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
