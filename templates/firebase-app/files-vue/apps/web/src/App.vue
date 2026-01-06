<script setup lang="ts">
/**
 * Main App Component
 *
 * Sets up routing with Vue Router.
 */

import { useAuth } from './composables/useAuth';

// Initialize auth on app mount
const { initAuth } = useAuth();
initAuth();
</script>

<template>
  <router-view />
</template>

<style>
@import './style.css';
</style>
