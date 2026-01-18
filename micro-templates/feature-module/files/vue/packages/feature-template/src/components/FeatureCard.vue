<script setup lang="ts">
import { Card } from '@{{org}}/shared';

defineProps<{
  item: {
    id: string;
    name: string;
    description?: string;
  };
}>();
</script>

<template>
  <Card class="hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ item.name }}</h3>
        <p v-if="item.description" class="mt-1 text-sm text-gray-500">
          {{ item.description }}
        </p>
      </div>
      <button class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  </Card>
</template>
