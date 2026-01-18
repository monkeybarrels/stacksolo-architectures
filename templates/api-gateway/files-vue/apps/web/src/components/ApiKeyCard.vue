<script setup lang="ts">
import { ref } from 'vue';
import type { ApiKey } from '../lib/api';

const props = defineProps<{
  apiKey: ApiKey;
  newKey?: string | null;
}>();

const emit = defineEmits<{
  (e: 'revoke', id: string): void;
  (e: 'rotate', id: string): void;
  (e: 'clearNewKey'): void;
}>();

const copied = ref(false);

function copyKey() {
  if (props.newKey) {
    navigator.clipboard.writeText(props.newKey);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
}

function handleRevoke() {
  if (confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
    emit('revoke', props.apiKey.id);
  }
}

function handleRotate() {
  if (confirm('Are you sure you want to rotate this API key? The old key will stop working immediately.')) {
    emit('rotate', props.apiKey.id);
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">{{ apiKey.name }}</h3>
          <span
            :class="[
              'px-2 py-0.5 text-xs font-medium rounded-full',
              apiKey.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ apiKey.status }}
          </span>
        </div>
        <p v-if="apiKey.description" class="mt-1 text-sm text-gray-500">
          {{ apiKey.description }}
        </p>
      </div>

      <div class="flex gap-2" v-if="apiKey.status === 'active'">
        <button
          @click="handleRotate"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Rotate
        </button>
        <button
          @click="handleRevoke"
          class="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Revoke
        </button>
      </div>
    </div>

    <!-- New Key Display (only shown once after creation) -->
    <div v-if="newKey" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center gap-2 text-yellow-800 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="font-medium">Copy your API key now - it won't be shown again!</span>
      </div>
      <div class="flex items-center gap-2">
        <code class="flex-1 bg-white px-3 py-2 rounded border border-yellow-300 text-sm font-mono overflow-x-auto">
          {{ newKey }}
        </code>
        <button
          @click="copyKey"
          class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button
          @click="$emit('clearNewKey')"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Key Info -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <div class="text-gray-500">Key Prefix</div>
        <div class="font-mono text-gray-900">{{ apiKey.keyPrefix }}...</div>
      </div>
      <div>
        <div class="text-gray-500">Plan</div>
        <div class="capitalize text-gray-900">{{ apiKey.plan }}</div>
      </div>
      <div>
        <div class="text-gray-500">Rate Limit</div>
        <div class="text-gray-900">{{ apiKey.rateLimit.toLocaleString() }}/min</div>
      </div>
      <div>
        <div class="text-gray-500">Daily Limit</div>
        <div class="text-gray-900">
          {{ apiKey.dailyLimit > 0 ? apiKey.dailyLimit.toLocaleString() : 'Unlimited' }}
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
      <div>Created: {{ formatDate(apiKey.createdAt) }}</div>
      <div>Last used: {{ formatDate(apiKey.lastUsedAt) }}</div>
    </div>
  </div>
</template>
