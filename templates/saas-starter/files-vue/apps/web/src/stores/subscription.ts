/**
 * Subscription Store
 *
 * Pinia store for subscription and billing state.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../lib/api';

export interface Plan {
  name: string;
  priceId: string;
  features: string[];
}

export interface Subscription {
  id: string;
  status: string;
  priceId: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<Subscription | null>(null);
  const plans = ref<Record<string, Plan>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isSubscribed = computed(() => {
    return subscription.value?.status === 'active' || subscription.value?.status === 'trialing';
  });

  const currentPlan = computed(() => {
    if (!subscription.value?.priceId) return null;
    return Object.entries(plans.value).find(
      ([, plan]) => plan.priceId === subscription.value?.priceId
    )?.[0];
  });

  const subscriptionEndDate = computed(() => {
    if (!subscription.value?.currentPeriodEnd) return null;
    return new Date(subscription.value.currentPeriodEnd);
  });

  async function fetchPlans() {
    try {
      plans.value = await api.getPlans();
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch plans';
    }
  }

  async function fetchSubscription() {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.getSubscription();
      subscription.value = data.subscription;
    } catch (e: any) {
      // No subscription is not an error
      if (e.message?.includes('404') || e.message?.includes('not found')) {
        subscription.value = null;
      } else {
        error.value = e.message || 'Failed to fetch subscription';
      }
    } finally {
      loading.value = false;
    }
  }

  async function createCheckout(priceId: string) {
    loading.value = true;
    error.value = null;
    try {
      const { url } = await api.createCheckout(priceId);
      window.location.href = url;
    } catch (e: any) {
      error.value = e.message || 'Failed to create checkout';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function openCustomerPortal() {
    loading.value = true;
    error.value = null;
    try {
      const { url } = await api.createPortal();
      window.location.href = url;
    } catch (e: any) {
      error.value = e.message || 'Failed to open customer portal';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    subscription,
    plans,
    loading,
    error,

    // Getters
    isSubscribed,
    currentPlan,
    subscriptionEndDate,

    // Actions
    fetchPlans,
    fetchSubscription,
    createCheckout,
    openCustomerPortal,
    clearError,
  };
});
