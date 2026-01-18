<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/layout/Navbar.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const features = [
  {
    title: 'Firebase Authentication',
    description: 'Secure email/password and Google sign-in out of the box.',
  },
  {
    title: 'Stripe Billing',
    description: 'Subscription management with customer portal integration.',
  },
  {
    title: 'PostgreSQL Database',
    description: 'Type-safe database access with Drizzle ORM.',
  },
  {
    title: 'Modern Stack',
    description: 'Vue 3, TypeScript, Tailwind CSS, and Pinia.',
  },
];
</script>

<template>
  <div class="min-h-screen bg-white">
    <Navbar />

    <!-- Hero -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Build your SaaS
          <span class="text-blue-600">faster</span>
        </h1>
        <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
          A complete foundation with authentication, billing, and user management.
          Everything you need to launch a subscription-based product.
        </p>
        <div class="mt-10 flex justify-center gap-4">
          <RouterLink
            v-if="!isAuthenticated"
            to="/signup"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Get Started
          </RouterLink>
          <RouterLink
            v-else
            to="/dashboard"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Go to Dashboard
          </RouterLink>
          <a
            href="https://github.com/monkeybarrels/stacksolo"
            target="_blank"
            rel="noopener"
            class="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-md text-lg font-medium"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
        Everything you need to get started
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-gray-50 rounded-lg p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Pricing -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
          Simple, transparent pricing
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Free -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 class="text-xl font-semibold text-gray-900">Free</h3>
            <p class="mt-2 text-gray-500">Get started with the basics</p>
            <p class="mt-4">
              <span class="text-4xl font-bold text-gray-900">$0</span>
              <span class="text-gray-500">/month</span>
            </p>
            <ul class="mt-6 space-y-3 text-gray-600">
              <li>Basic features</li>
              <li>Community support</li>
            </ul>
            <RouterLink
              to="/signup"
              class="mt-8 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium"
            >
              Get Started
            </RouterLink>
          </div>

          <!-- Pro -->
          <div class="bg-white rounded-lg shadow-lg border-2 border-blue-600 p-8 relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <h3 class="text-xl font-semibold text-gray-900">Pro</h3>
            <p class="mt-2 text-gray-500">For growing teams</p>
            <p class="mt-4">
              <span class="text-4xl font-bold text-gray-900">$19</span>
              <span class="text-gray-500">/month</span>
            </p>
            <ul class="mt-6 space-y-3 text-gray-600">
              <li>All free features</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
            </ul>
            <RouterLink
              to="/signup"
              class="mt-8 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Start Free Trial
            </RouterLink>
          </div>

          <!-- Business -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 class="text-xl font-semibold text-gray-900">Business</h3>
            <p class="mt-2 text-gray-500">For larger organizations</p>
            <p class="mt-4">
              <span class="text-4xl font-bold text-gray-900">$49</span>
              <span class="text-gray-500">/month</span>
            </p>
            <ul class="mt-6 space-y-3 text-gray-600">
              <li>All Pro features</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>SLA guarantee</li>
            </ul>
            <RouterLink
              to="/signup"
              class="mt-8 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium"
            >
              Contact Sales
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>Built with StackSolo</p>
      </div>
    </footer>
  </div>
</template>
