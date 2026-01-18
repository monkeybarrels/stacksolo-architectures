<script setup lang="ts">
import { Card, Button, useNotificationStore } from '@{{org}}/shared';
import { useFeatureStore } from '../stores/feature';
import FeatureCard from '../components/FeatureCard.vue';

const notifications = useNotificationStore();
const featureStore = useFeatureStore();

function handleAction() {
  notifications.show('Action completed!', 'success');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{Name}}</h1>
        <p class="text-gray-500 mt-1">
          Manage your {{name}} items here.
        </p>
      </div>
      <Button @click="handleAction">
        New Item
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="featureStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        v-for="item in featureStore.items"
        :key="item.id"
        :item="item"
      />

      <!-- Empty state -->
      <Card v-if="featureStore.items.length === 0" class="col-span-full">
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new item.</p>
          <div class="mt-6">
            <Button @click="handleAction">
              Create Item
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
