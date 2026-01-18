<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Navbar from '../components/layout/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div class="text-center">
        <p class="text-6xl font-bold text-blue-600">404</p>
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
        <p class="mt-2 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div class="mt-8">
          <RouterLink
            to="/"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium"
          >
            Go back home
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
