import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useInventoryControlStore = defineStore('inventoryControl', () => {
  const dataStore = useDataStore();
  const lots = computed(() => dataStore.D.inventoryLots);
  const criticalLots = computed(() => lots.value.filter(lot => ['critical', 'low', 'expiring'].includes(lot.status) || lot.fefoPriority === 'high'));
  const availabilitySnapshots = computed(() => dataStore.D.availabilitySnapshots);

  return { lots, criticalLots, availabilitySnapshots };
});
