<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cart';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

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

// Fetch cart when drawer opens
watch(
  () => cartStore.drawerOpen,
  (open) => {
    if (open) {
      cartStore.fetchCart();
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 z-40"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Shopping Cart</h2>
          <button
            @click="emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="cartStore.loading" class="flex items-center justify-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <div v-else-if="cartStore.items.length === 0" class="text-center py-12">
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
            <p class="mt-4 text-gray-500">Your cart is empty</p>
            <RouterLink
              to="/products"
              @click="emit('close')"
              class="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse products
            </RouterLink>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex gap-4 py-4 border-b border-gray-100 last:border-0"
            >
              <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="cartStore.getProduct(item.productId)?.images[0]"
                  :src="cartStore.getProduct(item.productId)?.images[0]"
                  :alt="cartStore.getProduct(item.productId)?.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 truncate">
                  {{ cartStore.getProduct(item.productId)?.name || 'Product' }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ formatPrice(
                    cartStore.getProduct(item.productId)?.price?.unitAmount || 0,
                    cartStore.getProduct(item.productId)?.price?.currency || 'usd'
                  ) }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                  <button
                    @click="cartStore.removeItem(item.id)"
                    class="ml-auto text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="cartStore.items.length > 0" class="border-t border-gray-200 px-6 py-4 space-y-4">
          <div class="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{{ formattedTotal }}</span>
          </div>
          <button
            @click="cartStore.checkout"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Checkout
          </button>
          <RouterLink
            to="/cart"
            @click="emit('close')"
            class="block text-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View full cart
          </RouterLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
