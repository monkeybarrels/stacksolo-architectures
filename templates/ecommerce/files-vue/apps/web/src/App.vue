<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';
import { onMounted } from 'vue';
import CartDrawer from './components/CartDrawer.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();

onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
  <template v-else>
    <RouterView />
    <CartDrawer :open="cartStore.drawerOpen" @close="cartStore.closeDrawer" />
  </template>
</template>
