<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'send', message: string): void;
}>();

const message = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function handleSubmit() {
  const trimmed = message.value.trim();
  if (!trimmed || props.disabled) return;

  emit('send', trimmed);
  message.value = '';

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
}

// Auto-resize textarea
watch(message, () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 200) + 'px';
  }
});
</script>

<template>
  <div class="border-t border-gray-200 bg-white p-4">
    <form @submit.prevent="handleSubmit" class="flex gap-3 items-end max-w-4xl mx-auto">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown="handleKeyDown"
          :disabled="disabled"
          rows="1"
          placeholder="Type a message..."
          class="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="!message.trim() || disabled"
        class="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>

    <p class="text-center text-xs text-gray-500 mt-2">
      Press Enter to send, Shift+Enter for new line
    </p>
  </div>
</template>
