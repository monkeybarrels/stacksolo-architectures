<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore } from '../stores/chat';
import { useAuthStore } from '../stores/auth';
import ChatMessage from '../components/ChatMessage.vue';
import ChatInput from '../components/ChatInput.vue';
import ConversationList from '../components/ConversationList.vue';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();

const messagesContainer = ref<HTMLElement | null>(null);
const sidebarOpen = ref(true);

const conversationId = computed(() => route.params.id as string | undefined);

// Load conversations on mount
onMounted(async () => {
  await chatStore.loadConversations();

  // Load specific conversation if ID in route
  if (conversationId.value) {
    await chatStore.loadConversation(conversationId.value);
  }
});

// Watch for route changes
watch(conversationId, async (newId) => {
  if (newId) {
    await chatStore.loadConversation(newId);
  } else {
    chatStore.startNewConversation();
  }
});

// Auto-scroll to bottom when messages change
watch(
  () => [chatStore.messages.length, chatStore.streamingContent],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
);

// Navigate to conversation when created
watch(
  () => chatStore.currentConversationId,
  (newId) => {
    if (newId && route.params.id !== newId) {
      router.replace(`/c/${newId}`);
    }
  }
);

function handleSelectConversation(id: string) {
  router.push(`/c/${id}`);
}

function handleNewChat() {
  chatStore.startNewConversation();
  router.push('/');
}

async function handleDeleteConversation(id: string) {
  await chatStore.deleteConversation(id);
  if (conversationId.value === id) {
    router.push('/');
  }
}

async function handleSendMessage(content: string) {
  await chatStore.sendMessage(content);
}

async function handleSignOut() {
  await authStore.signOut();
  router.push('/login');
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
      ]"
    >
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="font-semibold text-gray-900">AI Chat</span>
          </div>
        </div>

        <!-- Conversations -->
        <ConversationList
          :conversations="chatStore.conversations"
          :current-id="chatStore.currentConversationId"
          :loading="chatStore.loading"
          @select="handleSelectConversation"
          @delete="handleDeleteConversation"
          @new="handleNewChat"
          class="flex-1"
        />

        <!-- User Menu -->
        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
              {{ authStore.userEmail?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ authStore.userEmail }}
              </div>
            </div>
            <button
              @click="handleSignOut"
              class="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Sign out"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="font-medium text-gray-900">
          {{ chatStore.currentConversation?.title || 'New Chat' }}
        </h1>
      </header>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto"
      >
        <!-- Empty State -->
        <div
          v-if="chatStore.messages.length === 0 && !chatStore.isStreaming"
          class="h-full flex flex-col items-center justify-center p-8 text-center"
        >
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Start a conversation</h2>
          <p class="text-gray-500 max-w-md">
            Ask me anything! I can help with coding, writing, analysis, math, and much more.
          </p>

          <!-- Suggestion chips -->
          <div class="flex flex-wrap gap-2 mt-6 justify-center">
            <button
              v-for="suggestion in [
                'Explain quantum computing',
                'Help me write an email',
                'Debug my code',
                'Brainstorm ideas'
              ]"
              :key="suggestion"
              @click="handleSendMessage(suggestion)"
              class="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Message List -->
        <div v-else class="max-w-4xl mx-auto">
          <ChatMessage
            v-for="(message, index) in chatStore.messages"
            :key="index"
            :message="message"
          />

          <!-- Streaming Message -->
          <ChatMessage
            v-if="chatStore.isStreaming && chatStore.streamingContent"
            :message="{ role: 'model', content: chatStore.streamingContent, createdAt: new Date().toISOString() }"
            :is-streaming="true"
          />

          <!-- Loading indicator when streaming hasn't started -->
          <div
            v-if="chatStore.isStreaming && !chatStore.streamingContent"
            class="flex gap-4 p-4 bg-gray-50"
          >
            <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="chatStore.error"
          class="max-w-4xl mx-auto p-4"
        >
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ chatStore.error }}
          </div>
        </div>
      </div>

      <!-- Input -->
      <ChatInput
        :disabled="chatStore.isStreaming"
        @send="handleSendMessage"
      />
    </main>
  </div>
</template>
