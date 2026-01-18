<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSubscriptionStore } from '../stores/subscription';
import DashboardLayout from '../components/layout/DashboardLayout.vue';

const subscriptionStore = useSubscriptionStore();

const plans = computed(() => subscriptionStore.plans);
const subscription = computed(() => subscriptionStore.subscription);
const loading = computed(() => subscriptionStore.loading);
const error = computed(() => subscriptionStore.error);
const isSubscribed = computed(() => subscriptionStore.isSubscribed);
const currentPlan = computed(() => subscriptionStore.currentPlan);
const subscriptionEndDate = computed(() => subscriptionStore.subscriptionEndDate);

onMounted(async () => {
  await Promise.all([
    subscriptionStore.fetchPlans(),
    subscriptionStore.fetchSubscription(),
  ]);
});

async function handleUpgrade(priceId: string) {
  try {
    await subscriptionStore.createCheckout(priceId);
  } catch (e) {
    console.error('Failed to create checkout:', e);
  }
}

async function handleManageBilling() {
  try {
    await subscriptionStore.openCustomerPortal();
  } catch (e) {
    console.error('Failed to open portal:', e);
  }
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-4xl">
      <h1 class="text-2xl font-bold text-gray-900">Billing</h1>
      <p class="mt-1 text-gray-500">Manage your subscription and billing</p>

      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
        {{ error }}
      </div>

      <!-- Current Subscription -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Current Subscription</h2>

        <div v-if="isSubscribed" class="mt-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-bold text-gray-900 capitalize">{{ currentPlan }} Plan</p>
              <p class="text-sm text-gray-500">
                <span v-if="subscription?.cancelAtPeriodEnd" class="text-yellow-600">
                  Cancels on {{ formatDate(subscriptionEndDate) }}
                </span>
                <span v-else>
                  Renews on {{ formatDate(subscriptionEndDate) }}
                </span>
              </p>
            </div>
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          <button
            @click="handleManageBilling"
            :disabled="loading"
            class="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Manage Subscription
          </button>
        </div>

        <div v-else class="mt-4">
          <p class="text-gray-600">You're currently on the free plan.</p>
          <p class="text-sm text-gray-500 mt-1">
            Upgrade to unlock premium features.
          </p>
        </div>
      </div>

      <!-- Available Plans -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>

        <div v-if="Object.keys(plans).length === 0" class="text-gray-500">
          Loading plans...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(plan, key) in plans"
            :key="key"
            :class="[
              'bg-white rounded-lg shadow-sm border p-6',
              currentPlan === key ? 'border-blue-600 border-2' : 'border-gray-200',
            ]"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
              <span
                v-if="currentPlan === key"
                class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              >
                Current
              </span>
            </div>

            <ul class="mt-4 space-y-2">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-center text-sm text-gray-600"
              >
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ feature }}
              </li>
            </ul>

            <button
              v-if="currentPlan !== key"
              @click="handleUpgrade(plan.priceId)"
              :disabled="loading"
              class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              <span v-if="loading">Processing...</span>
              <span v-else-if="isSubscribed">Switch to {{ plan.name }}</span>
              <span v-else>Upgrade to {{ plan.name }}</span>
            </button>

            <button
              v-else
              disabled
              class="mt-6 w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900">Billing History</h2>
        <p class="mt-2 text-sm text-gray-500">
          View and download your past invoices in the customer portal.
        </p>
        <button
          v-if="isSubscribed"
          @click="handleManageBilling"
          :disabled="loading"
          class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          View Invoices &rarr;
        </button>
        <p v-else class="mt-4 text-sm text-gray-400">
          Billing history will appear here after you subscribe.
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>
