<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../lib/api';

const props = defineProps<{
  message: Message;
  isStreaming?: boolean;
}>();

const isUser = computed(() => props.message.role === 'user');

// Simple markdown-like formatting
const formattedContent = computed(() => {
  let content = props.message.content;

  // Code blocks
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-2"><code>$2</code></pre>');

  // Inline code
  content = content.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Bold
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Line breaks
  content = content.replace(/\n/g, '<br>');

  return content;
});
</script>

<template>
  <div :class="['flex gap-4 p-4', isUser ? 'bg-white' : 'bg-gray-50']">
    <!-- Avatar -->
    <div :class="[
      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
      isUser ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
    ]">
      <span v-if="isUser">U</span>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>

    <!-- Message Content -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-gray-900 mb-1">
        {{ isUser ? 'You' : 'Assistant' }}
      </div>
      <div
        class="prose prose-sm max-w-none text-gray-700"
        v-html="formattedContent"
      ></div>

      <!-- Streaming indicator -->
      <div v-if="isStreaming" class="flex items-center gap-1 mt-2">
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  </div>
</template>
