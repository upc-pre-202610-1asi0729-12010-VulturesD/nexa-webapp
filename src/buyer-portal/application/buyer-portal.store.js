import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

export const useBuyerPortalStore = defineStore('buyerPortal', () => {
  const auth = useAuthStore();
  const dataStore = useDataStore();

  const buyerClientId = computed(() => auth.user?.clientId || null);
  const buyerClient = computed(() => buyerClientId.value ? dataStore.clientById(buyerClientId.value) : null);
  const buyerRequests = computed(() => dataStore.D.purchaseRequests.filter(request => request.clientId === buyerClientId.value));
  const buyerOrders = computed(() => dataStore.D.purchaseOrders.filter(order => order.clientId === buyerClientId.value));
  const buyerDocuments = computed(() =>
    buyerOrders.value.flatMap(order => dataStore.documentsForOrder(order.id).filter(document => document.visibleToBuyer))
  );

  return { buyerClientId, buyerClient, buyerRequests, buyerOrders, buyerDocuments };
});
