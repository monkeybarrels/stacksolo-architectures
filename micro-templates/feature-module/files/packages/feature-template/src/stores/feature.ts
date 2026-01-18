import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface FeatureItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

/**
 * Feature-specific store.
 *
 * This store manages the state for the {{Name}} feature.
 * It can be exported from the feature's index.ts for use by other features.
 */
export const useFeatureStore = defineStore('{{name}}', () => {
  const items = ref<FeatureItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchItems() {
    loading.value = true;
    error.value = null;
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/{{name}}');
      // items.value = await response.json();

      // Mock data for development
      items.value = [
        { id: '1', name: 'Sample Item 1', description: 'Description for item 1', createdAt: new Date() },
        { id: '2', name: 'Sample Item 2', description: 'Description for item 2', createdAt: new Date() },
      ];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch items';
    } finally {
      loading.value = false;
    }
  }

  async function createItem(data: Omit<FeatureItem, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;
    try {
      // TODO: Replace with actual API call
      const newItem: FeatureItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      items.value.push(newItem);
      return newItem;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create item';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItem(id: string) {
    loading.value = true;
    error.value = null;
    try {
      // TODO: Replace with actual API call
      items.value = items.value.filter((item) => item.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete item';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    deleteItem,
  };
});
