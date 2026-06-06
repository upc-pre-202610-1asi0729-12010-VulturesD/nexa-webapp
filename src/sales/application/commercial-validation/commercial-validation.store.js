import { defineStore } from 'pinia';
import { useDataStore } from '@/app/application/stores/data.store';

export const useCommercialValidationStore = defineStore('commercialValidation', () => {
  const dataStore = useDataStore();

  function approve(requestId) {
    return dataStore.updateRequestStatus(requestId, 'approved');
  }

  function requestChanges(requestId, message) {
    dataStore.addMessage({ requestId, body: message || 'A commercial adjustment is requested before approval.' });
    return dataStore.updateRequestStatus(requestId, 'needs_adjustment');
  }

  function convertToOrder(requestId) {
    return dataStore.convertRequestToOrder(requestId);
  }

  return { approve, requestChanges, convertToOrder };
});
