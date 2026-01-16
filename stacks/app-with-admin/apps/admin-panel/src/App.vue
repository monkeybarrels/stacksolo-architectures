<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuth, signIn, signOut } from './services/auth';

const { user, loading, error, authorized } = useAuth();

// Nav links use relative paths (router base handles /admin prefix)
const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>

    <!-- Not signed in -->
    <div v-else-if="!user" class="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{projectName}} Admin</h1>
      <p class="text-gray-600 dark:text-gray-400">Sign in with your organization account</p>
      <button
        @click="signIn"
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        Sign in with Google
      </button>
    </div>

    <!-- Signed in but not authorized -->
    <div v-else-if="!authorized" class="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ error || 'Your account is not authorized to access the admin panel.' }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-500">
        Signed in as: {{ user.email }}
      </p>
      <button
        @click="signOut"
        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        Sign out and try another account
      </button>
    </div>

    <!-- Authorized - show admin panel -->
    <template v-else>
      <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <RouterLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
              {{projectName}} Admin
            </RouterLink>

            <div class="flex items-center gap-4">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {{ link.label }}
              </RouterLink>
              <span class="text-sm text-gray-500">{{ user.email }}</span>
              <button
                @click="signOut"
                class="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="container mx-auto px-4 py-8">
        <router-view />
      </main>
    </template>
  </div>
</template>
