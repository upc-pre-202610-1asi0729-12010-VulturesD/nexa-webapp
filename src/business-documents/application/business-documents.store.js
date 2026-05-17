import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useBusinessDocumentsStore = defineStore('businessDocuments', () => {
  const dataStore = useDataStore();
  const documents = computed(() => dataStore.D.businessDocuments);
  const pendingDocuments = computed(() => documents.value.filter(document => document.required && ['pending', 'observed', 'rejected'].includes(document.status)));

  function markStatus(documentId, status) {
    return dataStore.updateDocumentStatus(documentId, status);
  }

  return { documents, pendingDocuments, markStatus };
});
