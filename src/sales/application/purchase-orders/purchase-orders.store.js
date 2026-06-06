import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const usePurchaseOrdersStore = defineStore('purchaseOrders', () => {
  const dataStore = useDataStore();
  const orders = computed(() => dataStore.D.purchaseOrders);
  const blockedOrders = computed(() => orders.value.filter(order => ['pending', 'blocked', 'document_pending', 'validating'].includes(order.status)));

  function findById(id) {
    return dataStore.purchaseOrderById(id);
  }

  return { orders, blockedOrders, findById };
});
