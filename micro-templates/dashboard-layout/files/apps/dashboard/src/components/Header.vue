<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}>();

const emit = defineEmits<{
  logout: [];
}>();

const isDropdownOpen = ref(false);

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

function handleLogout() {
  closeDropdown();
  emit('logout');
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <!-- Left side - Page title or breadcrumbs -->
    <div>
      <slot name="left">
        <h1 class="text-lg font-semibold text-gray-900">Dashboard</h1>
      </slot>
    </div>

    <!-- Right side - User menu -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="flex items-center space-x-3 focus:outline-none"
      >
        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
          <template v-if="user?.avatar">
            <img :src="user.avatar" :alt="user.name" class="w-full h-full rounded-full object-cover" />
          </template>
          <template v-else>
            {{ user?.name?.charAt(0) || 'U' }}
          </template>
        </div>

        <!-- Name (hidden on mobile) -->
        <span class="hidden md:block text-sm font-medium text-gray-700">
          {{ user?.name || 'User' }}
        </span>

        <!-- Dropdown arrow -->
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50"
          @click.outside="closeDropdown"
        >
          <div class="px-4 py-2 border-b border-gray-100">
            <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email || 'user@example.com' }}</p>
          </div>

          <a
            href="#"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click.prevent="closeDropdown"
          >
            Your Profile
          </a>
          <a
            href="#"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click.prevent="closeDropdown"
          >
            Settings
          </a>
          <button
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>
