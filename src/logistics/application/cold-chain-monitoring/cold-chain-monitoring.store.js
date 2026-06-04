import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useColdChainMonitoringStore = defineStore('coldChainMonitoring', () => {
  const dataStore = useDataStore();
  const temperatureLogs = computed(() => dataStore.D.temperatureLogs);
  const riskLogs = computed(() => temperatureLogs.value.filter(log => log.status !== 'ok'));

  return { temperatureLogs, riskLogs };
});
