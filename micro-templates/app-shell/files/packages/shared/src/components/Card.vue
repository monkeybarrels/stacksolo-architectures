<script setup lang="ts">
defineProps<{
  title?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div v-if="title" class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
    </div>
    <div
      :class="[
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-2',
        padding === 'lg' && 'p-6',
        (!padding || padding === 'md') && 'p-4',
      ]"
    >
      <slot />
    </div>
  </div>
</template>
