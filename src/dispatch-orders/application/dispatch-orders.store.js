import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useDispatchOrdersStore = defineStore('dispatchOrders', () => {
  const dataStore = useDataStore();
  const dispatchOrders = computed(() => dataStore.D.dispatchOrders);

  function move(dispatchId, status) {
    return dataStore.updateDispatchStatus(dispatchId, status);
  }

  return { dispatchOrders, move };
});
