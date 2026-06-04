import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useCustomerPortalsStore = defineStore('customerPortals', () => {
  const dataStore = useDataStore();
  const portals = computed(() => dataStore.D.customerPortals);
  const uploadTasks = computed(() => dataStore.D.portalUploadTasks);

  function requirementsForClient(clientId) {
    return dataStore.portalRequirementsForClient(clientId);
  }

  return { portals, uploadTasks, requirementsForClient };
});
