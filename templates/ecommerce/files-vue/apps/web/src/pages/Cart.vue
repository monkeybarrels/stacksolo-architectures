<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

const formattedTotal = computed(() => {
  const amount = cartStore.total / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cartStore.currency,
  }).format(amount);
});

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div v-if="cartStore.loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="cartStore.items.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p class="mt-2 text-gray-500">Add some products to get started!</p>
        <RouterLink
          to="/products"
          class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Products
        </RouterLink>
      </div>

      <div v-else class="space-y-6">
        <!-- Cart Items -->
        <div class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="p-6 flex gap-6"
          >
            <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="cartStore.getProduct(item.productId)?.images[0]"
                :src="cartStore.getProduct(item.productId)?.images[0]"
                :alt="cartStore.getProduct(item.productId)?.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1">
              <div class="flex justify-between">
                <div>
                  <RouterLink
                    :to="`/products/${item.productId}`"
                    class="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {{ cartStore.getProduct(item.productId)?.name || 'Product' }}
                  </RouterLink>
                  <p class="mt-1 text-gray-500">
                    {{ formatPrice(
                      cartStore.getProduct(item.productId)?.price?.unitAmount || 0,
                      cartStore.getProduct(item.productId)?.price?.currency || 'usd'
                    ) }} each
                  </p>
                </div>
                <p class="font-semibold text-gray-900">
                  {{ formatPrice(
                    (cartStore.getProduct(item.productId)?.price?.unitAmount || 0) * item.quantity,
                    cartStore.getProduct(item.productId)?.price?.currency || 'usd'
                  ) }}
                </p>
              </div>
              <div class="mt-4 flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                    class="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span class="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                    {{ item.quantity }}
                  </span>
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                    class="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <button
                  @click="cartStore.removeItem(item.id)"
                  class="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>{{ formattedTotal }}</span>
          </div>
          <button
            @click="cartStore.checkout"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Proceed to Checkout
          </button>
          <div class="mt-4 text-center">
            <RouterLink
              to="/products"
              class="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Continue Shopping
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
