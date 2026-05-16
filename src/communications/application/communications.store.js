import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useCommunicationsStore = defineStore('communications', () => {
  const dataStore = useDataStore();
  const messages = computed(() => dataStore.D.messages);

  function addContextMessage(payload) {
    return dataStore.addMessage(payload);
  }

  return { messages, addContextMessage };
});
