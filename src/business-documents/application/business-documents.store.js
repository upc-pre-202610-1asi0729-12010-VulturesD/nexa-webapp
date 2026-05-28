import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useBusinessDocumentsStore = defineStore('businessDocuments', () => {
  const dataStore = useDataStore();
  const documents = computed(() => dataStore.D.businessDocuments);
  const pendingDocuments = computed(() => documents.value.filter(document => document.required && ['pending', 'observed', 'rejected'].includes(document.status)));
  const billingSummary = computed(() => ({
    pending: pendingDocuments.value.length,
    accepted: documents.value.filter(document => ['accepted', 'uploaded', 'generated'].includes(document.status)).length,
    failedPayments: dataStore.D.purchaseOrders.filter(order => order.paymentStatus === 'failed').length,
  }));

  function markStatus(documentId, status) {
    return dataStore.updateDocumentStatus(documentId, status);
  }

  return { documents, pendingDocuments, billingSummary, markStatus };
});
