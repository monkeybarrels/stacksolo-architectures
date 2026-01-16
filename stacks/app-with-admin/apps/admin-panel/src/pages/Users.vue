<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, type User } from '../services/api';

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    users.value = await getUsers();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load users';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Users</h1>

    <div v-if="loading" class="text-gray-600 dark:text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
              {{ user.email || 'No email' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
              {{ new Date(user.createdAt).toLocaleDateString() }}
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="2" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No users found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
