<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useShellStore } from '../stores/shell';
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

const shellStore = useShellStore();
const authStore = useAuthStore();

const navItems = computed(() => shellStore.navItems);
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white shadow-lg transition-all duration-300 flex flex-col',
        shellStore.sidebarOpen ? 'w-64' : 'w-16'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b">
        <span v-if="shellStore.sidebarOpen" class="text-xl font-bold text-gray-800">
          {{projectName}}
        </span>
        <span v-else class="text-xl font-bold text-gray-800">
          {{projectName[0] || 'A'}}
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          active-class="bg-blue-50 text-blue-600 border-r-2 border-blue-600"
        >
          <span class="w-6 h-6 flex items-center justify-center">
            <!-- Simple icon placeholder -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </span>
          <span v-if="shellStore.sidebarOpen" class="ml-3">
            {{ item.name }}
          </span>
        </router-link>
      </nav>

      <!-- Toggle button -->
      <button
        @click="shellStore.toggleSidebar()"
        class="p-4 border-t text-gray-500 hover:text-gray-700"
      >
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': !shellStore.sidebarOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <h1 class="text-lg font-semibold text-gray-800">
          <!-- Page title could be injected from route meta -->
        </h1>

        <!-- User menu -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <img
              v-if="authStore.userAvatar"
              :src="authStore.userAvatar"
              :alt="authStore.userName || 'User'"
              class="w-8 h-8 rounded-full"
            />
            <div v-else class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              {{ (authStore.userName || authStore.userEmail || 'U')[0].toUpperCase() }}
            </div>
            <span class="text-sm text-gray-700">
              {{ authStore.userName || authStore.userEmail }}
            </span>
          </div>
          <button
            @click="authStore.signOut()"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
