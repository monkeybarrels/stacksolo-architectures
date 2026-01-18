<script setup lang="ts">
import { ref } from 'vue';
import { Card, Button, useNotificationStore, useCurrentUser } from '@{{org}}/shared';
import StatsCard from '../components/StatsCard.vue';

const notifications = useNotificationStore();
const { userName, userEmail } = useCurrentUser();

const stats = ref([
  { label: 'Total Users', value: '1,234', change: '+12%' },
  { label: 'Active Sessions', value: '56', change: '+4%' },
  { label: 'Revenue', value: '$12,345', change: '+8%' },
  { label: 'Conversion Rate', value: '3.2%', change: '-0.5%' },
]);

function showNotification() {
  notifications.show('Welcome to your dashboard!', 'success');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back{{ userName ? `, ${userName}` : '' }}!
        </h1>
        <p class="text-gray-500 mt-1">
          Here's what's happening with your app today.
        </p>
      </div>
      <Button @click="showNotification">
        Test Notification
      </Button>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
      />
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Recent Activity">
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-sm">U</span>
            </div>
            <div>
              <p class="text-sm font-medium">New user signed up</p>
              <p class="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600 text-sm">$</span>
            </div>
            <div>
              <p class="text-sm font-medium">Payment received</p>
              <p class="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-600 text-sm">F</span>
            </div>
            <div>
              <p class="text-sm font-medium">Feature deployed</p>
              <p class="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Quick Actions">
        <div class="space-y-3">
          <Button variant="secondary" class="w-full justify-start">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Project
          </Button>
          <Button variant="secondary" class="w-full justify-start">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Invite Team Members
          </Button>
          <Button variant="secondary" class="w-full justify-start">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure Settings
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
