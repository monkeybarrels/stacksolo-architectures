<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';

const router = useRouter();

// Mock user - replace with actual auth store
const user = ref({
  name: 'John Doe',
  email: 'john@example.com',
});

function handleLogout() {
  // Implement logout logic
  // Example: authStore.logout()
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header :user="user" @logout="handleLogout" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
