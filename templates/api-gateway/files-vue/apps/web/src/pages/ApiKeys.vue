<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useApiKeysStore } from '../stores/apiKeys';
import DashboardLayout from '../components/DashboardLayout.vue';
import ApiKeyCard from '../components/ApiKeyCard.vue';

const apiKeysStore = useApiKeysStore();

const showCreateModal = ref(false);
const newKeyName = ref('');
const newKeyDescription = ref('');
const creating = ref(false);

onMounted(async () => {
  await apiKeysStore.loadKeys();
});

const activeKeys = computed(() => apiKeysStore.keys.filter(k => k.status === 'active'));
const revokedKeys = computed(() => apiKeysStore.keys.filter(k => k.status !== 'active'));

async function handleCreateKey() {
  if (!newKeyName.value.trim()) return;

  creating.value = true;
  await apiKeysStore.createKey(newKeyName.value, newKeyDescription.value || undefined);
  creating.value = false;
  showCreateModal.value = false;
  newKeyName.value = '';
  newKeyDescription.value = '';
}

async function handleRevoke(keyId: string) {
  await apiKeysStore.revokeKey(keyId);
}

async function handleRotate(keyId: string) {
  await apiKeysStore.rotateKey(keyId);
}
</script>

<template>
  <DashboardLayout>
    <div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">API Keys</h1>
          <p class="mt-1 text-gray-500">Manage your API keys</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create API Key
        </button>
      </div>

      <!-- Error -->
      <div v-if="apiKeysStore.error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ apiKeysStore.error }}
      </div>

      <!-- Loading -->
      <div v-if="apiKeysStore.loading" class="mt-8 text-center text-gray-500">
        Loading...
      </div>

      <!-- Active Keys -->
      <div v-else class="mt-8 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Active Keys ({{ activeKeys.length }})</h2>

        <div v-if="activeKeys.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No API keys yet</h3>
          <p class="mt-2 text-gray-500">Create your first API key to start making requests.</p>
          <button
            @click="showCreateModal = true"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create API Key
          </button>
        </div>

        <ApiKeyCard
          v-for="key in activeKeys"
          :key="key.id"
          :api-key="key"
          :new-key="key.id === activeKeys[0]?.id ? apiKeysStore.newlyCreatedKey : null"
          @revoke="handleRevoke"
          @rotate="handleRotate"
          @clear-new-key="apiKeysStore.clearNewKey()"
        />
      </div>

      <!-- Revoked Keys -->
      <div v-if="revokedKeys.length > 0" class="mt-8 space-y-4">
        <h2 class="text-lg font-semibold text-gray-500">Revoked Keys ({{ revokedKeys.length }})</h2>
        <ApiKeyCard
          v-for="key in revokedKeys"
          :key="key.id"
          :api-key="key"
          class="opacity-60"
        />
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-semibold text-gray-900">Create API Key</h2>
          <p class="mt-1 text-sm text-gray-500">
            The API key will only be shown once after creation.
          </p>

          <form @submit.prevent="handleCreateKey" class="mt-6 space-y-4">
            <div>
              <label for="keyName" class="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="keyName"
                v-model="newKeyName"
                type="text"
                required
                placeholder="Production API Key"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label for="keyDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="keyDescription"
                v-model="newKeyDescription"
                rows="2"
                placeholder="Optional description..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="showCreateModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newKeyName.trim() || creating"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creating ? 'Creating...' : 'Create Key' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
