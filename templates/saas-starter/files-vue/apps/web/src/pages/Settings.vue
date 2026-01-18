<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../lib/api';
import DashboardLayout from '../components/layout/DashboardLayout.vue';

const authStore = useAuthStore();

const userEmail = computed(() => authStore.userEmail);

const name = ref('');
const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const profile = await api.getProfile();
    name.value = profile.name || '';
  } catch (e) {
    console.error('Failed to fetch profile:', e);
  } finally {
    loading.value = false;
  }
});

// Clear success message after showing
watch(success, (val) => {
  if (val) {
    setTimeout(() => {
      success.value = false;
    }, 3000);
  }
});

async function handleSave() {
  saving.value = true;
  error.value = null;
  success.value = false;

  try {
    await api.updateProfile({ name: name.value });
    success.value = true;
  } catch (e: any) {
    error.value = e.message || 'Failed to save settings';
  } finally {
    saving.value = false;
  }
}

function handleDeleteAccount() {
  // TODO: Implement account deletion
  alert('Account deletion would go here');
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="mt-1 text-gray-500">Manage your account settings</p>

      <div v-if="loading" class="mt-8">
        <div class="animate-pulse space-y-4">
          <div class="h-16 bg-gray-200 rounded-lg"></div>
          <div class="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <form v-else @submit.prevent="handleSave" class="mt-8 space-y-6">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          Settings saved successfully!
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900">Profile</h2>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              :value="userEmail"
              disabled
              class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-gray-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div class="pt-4 border-t border-gray-200">
            <button
              type="submit"
              :disabled="saving"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 class="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p class="mt-2 text-sm text-gray-500">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            type="button"
            class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            @click="handleDeleteAccount"
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
