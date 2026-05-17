import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const dataStore = useDataStore();
  const currentTenant = computed(() => dataStore.D.tenants[0] || {});
  const plans = computed(() => dataStore.D.subscriptions || []);
  const currentPlan = computed(() => plans.value.find(plan => plan.id === currentTenant.value.planId || plan.key === currentTenant.value.subscriptionPlan) || plans.value.find(plan => plan.key === 'standard') || {});

  function hasFeature(featureKey) {
    return Boolean(currentPlan.value.features?.[featureKey] || currentPlan.value.featureGates?.[featureKey]);
  }

  return { currentTenant, plans, currentPlan, hasFeature };
});
