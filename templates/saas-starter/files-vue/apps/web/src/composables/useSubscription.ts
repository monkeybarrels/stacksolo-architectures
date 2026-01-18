/**
 * useSubscription Composable
 *
 * Convenience wrapper around the subscription store for use in components.
 */

import { computed } from 'vue';
import { useSubscriptionStore } from '../stores/subscription';

export function useSubscription() {
  const store = useSubscriptionStore();

  return {
    // State
    subscription: computed(() => store.subscription),
    plans: computed(() => store.plans),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Getters
    isSubscribed: computed(() => store.isSubscribed),
    currentPlan: computed(() => store.currentPlan),
    subscriptionEndDate: computed(() => store.subscriptionEndDate),

    // Actions
    fetchPlans: store.fetchPlans,
    fetchSubscription: store.fetchSubscription,
    createCheckout: store.createCheckout,
    openCustomerPortal: store.openCustomerPortal,
    clearError: store.clearError,
  };
}
