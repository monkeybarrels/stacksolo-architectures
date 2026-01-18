/**
 * Chat Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, type Conversation, type ConversationSummary, type Message } from '../lib/api';

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ConversationSummary[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const messages = ref<Message[]>([]);
  const isStreaming = ref(false);
  const streamingContent = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentConversationId = computed(() => currentConversation.value?.id);

  async function loadConversations() {
    loading.value = true;
    error.value = null;
    try {
      const result = await api.listConversations();
      conversations.value = result.conversations;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function loadConversation(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await api.getConversation(id);
      currentConversation.value = result.conversation;
      messages.value = result.conversation.messages;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  function startNewConversation() {
    currentConversation.value = null;
    messages.value = [];
    streamingContent.value = '';
  }

  async function sendMessage(content: string) {
    if (isStreaming.value) return;

    error.value = null;
    isStreaming.value = true;
    streamingContent.value = '';

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    messages.value = [...messages.value, userMessage];

    try {
      let conversationId = currentConversationId.value;

      for await (const event of api.streamChat(content, conversationId || undefined)) {
        if (event.type === 'chunk' && event.content) {
          streamingContent.value += event.content;
        } else if (event.type === 'done' && event.conversationId) {
          conversationId = event.conversationId;

          // Add the complete assistant message
          const assistantMessage: Message = {
            role: 'model',
            content: streamingContent.value,
            createdAt: new Date().toISOString(),
          };
          messages.value = [...messages.value, assistantMessage];
          streamingContent.value = '';

          // Update current conversation
          if (!currentConversation.value) {
            currentConversation.value = {
              id: conversationId,
              title: content.length > 50 ? content.substring(0, 47) + '...' : content,
              messages: messages.value,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          // Refresh conversation list
          await loadConversations();
        } else if (event.type === 'error') {
          throw new Error(event.error || 'Stream error');
        }
      }
    } catch (e: any) {
      error.value = e.message;
      // Remove the user message if there was an error
      messages.value = messages.value.slice(0, -1);
    } finally {
      isStreaming.value = false;
    }
  }

  async function deleteConversation(id: string) {
    try {
      await api.deleteConversation(id);
      conversations.value = conversations.value.filter((c) => c.id !== id);
      if (currentConversation.value?.id === id) {
        startNewConversation();
      }
    } catch (e: any) {
      error.value = e.message;
    }
  }

  return {
    conversations,
    currentConversation,
    currentConversationId,
    messages,
    isStreaming,
    streamingContent,
    loading,
    error,
    loadConversations,
    loadConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
  };
});
