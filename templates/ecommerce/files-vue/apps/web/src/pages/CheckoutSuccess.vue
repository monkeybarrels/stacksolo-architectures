<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

onMounted(() => {
  // Clear local cart state since Stripe webhook will handle the order
  cartStore.items = [];
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            class="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 class="mt-6 text-3xl font-bold text-gray-900">
          Thank you for your order!
        </h1>

        <p class="mt-4 text-lg text-gray-600">
          Your payment was successful. We've sent a confirmation email with your order details.
        </p>

        <div class="mt-8 space-y-4">
          <RouterLink
            to="/orders"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Your Orders
          </RouterLink>

          <div>
            <RouterLink
              to="/products"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              Continue Shopping
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="mt-12 bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">What happens next?</h2>
        <ul class="mt-4 space-y-3 text-gray-600">
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>You'll receive an email confirmation with your order details.</span>
          </li>
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Your order will be processed and prepared for delivery.</span>
          </li>
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>You can track your order status in the Orders section.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
