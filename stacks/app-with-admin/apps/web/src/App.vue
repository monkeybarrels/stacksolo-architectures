<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useAuth, signIn, signOut } from './services/auth';

const { user, loading, isAuthenticated } = useAuth();
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <RouterLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
            {{projectName}}
          </RouterLink>

          <div class="flex items-center gap-4">
            <template v-if="loading">
              <span class="text-gray-500">Loading...</span>
            </template>
            <template v-else-if="isAuthenticated">
              <RouterLink
                to="/dashboard"
                class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Dashboard
              </RouterLink>
              <span class="text-sm text-gray-500">{{ user?.email }}</span>
              <button
                @click="signOut"
                class="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </template>
            <template v-else>
              <button
                @click="signIn"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Sign in
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
