<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();

const isAuthenticated = computed(() => !!authStore.user);
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <span class="text-xl font-bold text-gray-900">Store</span>
          </RouterLink>
          <div class="hidden sm:ml-8 sm:flex sm:space-x-6">
            <RouterLink
              to="/products"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Products
            </RouterLink>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="cartStore.openDrawer"
            class="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartStore.itemCount }}
            </span>
          </button>
          <template v-if="isAuthenticated">
            <RouterLink
              to="/orders"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Orders
            </RouterLink>
            <button
              @click="authStore.signOut"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </template>
          <RouterLink
            v-else
            to="/login"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Sign in
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
