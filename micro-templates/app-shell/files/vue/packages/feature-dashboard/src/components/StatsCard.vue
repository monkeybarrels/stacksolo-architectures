<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string;
  change: string;
}>();

const isPositive = computed(() => props.change.startsWith('+'));
const isNegative = computed(() => props.change.startsWith('-'));
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-500">{{ label }}</span>
      <span
        :class="[
          'text-xs font-medium px-2 py-1 rounded',
          isPositive && 'bg-green-100 text-green-800',
          isNegative && 'bg-red-100 text-red-800',
          !isPositive && !isNegative && 'bg-gray-100 text-gray-800',
        ]"
      >
        {{ change }}
      </span>
    </div>
    <p class="text-2xl font-bold text-gray-900 mt-2">{{ value }}</p>
  </div>
</template>
