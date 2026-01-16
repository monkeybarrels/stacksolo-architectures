<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { adminApi } from '../services/api';

const route = useRoute();
const router = useRouter();
const user = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);

const editForm = ref({
  name: '',
  status: 'active',
  notes: '',
});

onMounted(async () => {
  await fetchUser();
});

async function fetchUser() {
  loading.value = true;
  error.value = null;

  try {
    const response = await adminApi.getUser(route.params.id as string);
    user.value = response.data;
    editForm.value = {
      name: user.value.name || '',
      status: user.value.status || 'active',
      notes: user.value.adminNotes || '',
    };
  } catch (e: any) {
    error.value = e.message || 'Failed to load user';
  } finally {
    loading.value = false;
  }
}

async function saveUser() {
  saving.value = true;
  try {
    await adminApi.updateUser(route.params.id as string, editForm.value);
    await fetchUser();
  } catch (e: any) {
    error.value = e.message || 'Failed to save';
  } finally {
    saving.value = false;
  }
}

async function deleteUser() {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    await adminApi.deleteUser(route.params.id as string);
    router.push('/users');
  } catch (e: any) {
    error.value = e.message || 'Failed to delete';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Detail</h1>
      <button
        @click="router.push('/users')"
        class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        ← Back to Users
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 dark:text-gray-400">Loading...</div>

    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>

    <div v-else-if="user" class="grid gap-6 md:grid-cols-2">
      <!-- User Info -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Info</h2>
        <dl class="space-y-3">
          <div>
            <dt class="text-sm text-gray-500 dark:text-gray-400">ID</dt>
            <dd class="text-gray-900 dark:text-white font-mono text-sm">{{ user.id }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500 dark:text-gray-400">Email</dt>
            <dd class="text-gray-900 dark:text-white">{{ user.email }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500 dark:text-gray-400">Created</dt>
            <dd class="text-gray-900 dark:text-white">{{ new Date(user.createdAt).toLocaleString() }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500 dark:text-gray-400">Updated</dt>
            <dd class="text-gray-900 dark:text-white">{{ new Date(user.updatedAt).toLocaleString() }}</dd>
          </div>
        </dl>
      </div>

      <!-- Edit Form -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit User</h2>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              v-model="editForm.status"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Admin Notes</label>
            <textarea
              v-model="editForm.notes"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              type="button"
              @click="deleteUser"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
