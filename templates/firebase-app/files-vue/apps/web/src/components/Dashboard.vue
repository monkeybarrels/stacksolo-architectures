<script setup lang="ts">
/**
 * Dashboard Component
 *
 * Protected page showing user info and calling the authenticated API.
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

interface UserProfile {
  uid: string;
  email: string;
  createdAt?: string;
}

const profile = ref<UserProfile | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');

const router = useRouter();
const { user, signOut, getIdToken } = useAuth();

const fetchProfile = async () => {
  try {
    const token = await getIdToken();
    if (!token) {
      errorMessage.value = 'Not authenticated';
      return;
    }

    const response = await fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    profile.value = await response.json();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load profile';
  } finally {
    isLoading.value = false;
  }
};

const handleSignOut = async () => {
  await signOut();
  router.push('/login');
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <button @click="handleSignOut" class="btn-secondary">
        Sign Out
      </button>
    </header>

    <main class="dashboard-content">
      <div class="card">
        <h2>Welcome!</h2>
        <p>You're signed in as <strong>{{ user?.email }}</strong></p>
      </div>

      <div class="card">
        <h2>Your Profile</h2>
        <p v-if="isLoading">Loading profile...</p>
        <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <dl v-else-if="profile" class="profile-details">
          <dt>User ID</dt>
          <dd>{{ profile.uid }}</dd>
          <dt>Email</dt>
          <dd>{{ profile.email }}</dd>
          <template v-if="profile.createdAt">
            <dt>Member since</dt>
            <dd>{{ new Date(profile.createdAt).toLocaleDateString() }}</dd>
          </template>
        </dl>
      </div>
    </main>
  </div>
</template>
