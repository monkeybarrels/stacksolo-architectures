<script setup lang="ts">
import { computed } from 'vue';
import type { ConversationSummary } from '../lib/api';

const props = defineProps<{
  conversations: ConversationSummary[];
  currentId?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'new'): void;
}>();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Group conversations by date
const groupedConversations = computed(() => {
  const groups: { label: string; items: ConversationSummary[] }[] = [];
  const today: ConversationSummary[] = [];
  const yesterday: ConversationSummary[] = [];
  const thisWeek: ConversationSummary[] = [];
  const older: ConversationSummary[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const conv of props.conversations) {
    const date = new Date(conv.updatedAt);
    if (date >= todayStart) {
      today.push(conv);
    } else if (date >= yesterdayStart) {
      yesterday.push(conv);
    } else if (date >= weekStart) {
      thisWeek.push(conv);
    } else {
      older.push(conv);
    }
  }

  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
  if (older.length) groups.push({ label: 'Older', items: older });

  return groups;
});

function handleDelete(e: Event, id: string) {
  e.stopPropagation();
  if (confirm('Delete this conversation?')) {
    emit('delete', id);
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- New Chat Button -->
    <div class="p-3 border-b border-gray-200">
      <button
        @click="emit('new')"
        class="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-gray-500">
        <div class="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>

      <div v-else-if="conversations.length === 0" class="p-4 text-center text-gray-500 text-sm">
        No conversations yet
      </div>

      <div v-else class="py-2">
        <div v-for="group in groupedConversations" :key="group.label" class="mb-2">
          <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {{ group.label }}
          </div>

          <button
            v-for="conv in group.items"
            :key="conv.id"
            @click="emit('select', conv.id)"
            :class="[
              'w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors group flex items-center gap-3',
              currentId === conv.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            ]"
          >
            <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ conv.title }}
              </div>
              <div class="text-xs text-gray-500">
                {{ conv.messageCount }} message{{ conv.messageCount === 1 ? '' : 's' }}
              </div>
            </div>

            <button
              @click="handleDelete($event, conv.id)"
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
              title="Delete conversation"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
