<script setup lang="ts">
import { useAuth, signIn } from '../services/auth';

const { isAuthenticated } = useAuth();
</script>

<template>
  <div class="text-center py-20">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
      Welcome to {{projectName}}
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      Your full-stack application is ready to go.
    </p>

    <div v-if="!isAuthenticated" class="space-y-4">
      <button
        @click="signIn"
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark text-lg"
      >
        Get Started
      </button>
      <p class="text-gray-500">Sign in with Google to continue</p>
    </div>

    <div v-else>
      <RouterLink
        to="/dashboard"
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark text-lg inline-block"
      >
        Go to Dashboard
      </RouterLink>
    </div>
  </div>
</template>
