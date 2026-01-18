/**
 * API Keys Store
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, type ApiKey, type DailyUsage, type Plan } from '../lib/api';

export const useApiKeysStore = defineStore('apiKeys', () => {
  const keys = ref<ApiKey[]>([]);
  const usage = ref<DailyUsage[]>([]);
  const usageSummary = ref<{ totalRequests: number; totalErrors: number }>({ totalRequests: 0, totalErrors: 0 });
  const plans = ref<Plan[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Store the newly created key (only available once)
  const newlyCreatedKey = ref<string | null>(null);

  async function loadKeys() {
    loading.value = true;
    error.value = null;
    try {
      const result = await api.listKeys();
      keys.value = result.keys;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createKey(name: string, description?: string): Promise<string | null> {
    error.value = null;
    try {
      const result = await api.createKey(name, description);
      keys.value = [result.apiKey, ...keys.value];
      newlyCreatedKey.value = result.key;
      return result.key;
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  async function revokeKey(keyId: string): Promise<boolean> {
    error.value = null;
    try {
      await api.revokeKey(keyId);
      keys.value = keys.value.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k));
      return true;
    } catch (e: any) {
      error.value = e.message;
      return false;
    }
  }

  async function rotateKey(keyId: string): Promise<string | null> {
    error.value = null;
    try {
      const result = await api.rotateKey(keyId);
      // Remove old key, add new one
      keys.value = keys.value.filter((k) => k.id !== keyId);
      keys.value = [result.apiKey, ...keys.value];
      newlyCreatedKey.value = result.key;
      return result.key;
    } catch (e: any) {
      error.value = e.message;
      return null;
    }
  }

  async function loadUsage(days: number = 30, keyId?: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await api.getUsage(days, keyId);
      usage.value = result.usage;
      usageSummary.value = result.summary;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function loadPlans() {
    try {
      const result = await api.getPlans();
      plans.value = result.plans;
    } catch (e: any) {
      error.value = e.message;
    }
  }

  function clearNewKey() {
    newlyCreatedKey.value = null;
  }

  return {
    keys,
    usage,
    usageSummary,
    plans,
    loading,
    error,
    newlyCreatedKey,
    loadKeys,
    createKey,
    revokeKey,
    rotateKey,
    loadUsage,
    loadPlans,
    clearNewKey,
  };
});
