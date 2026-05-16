import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const usePurchaseRequestsStore = defineStore('purchaseRequests', () => {
  const dataStore = useDataStore();
  const requests = computed(() => dataStore.D.purchaseRequests);
  const pendingRequests = computed(() => requests.value.filter(request => ['submitted', 'in_review', 'needs_adjustment'].includes(request.status)));

  function findById(id) {
    return dataStore.purchaseRequestById(id);
  }

  return { requests, pendingRequests, findById };
});
