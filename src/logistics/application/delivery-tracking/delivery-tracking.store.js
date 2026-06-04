import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useDeliveryTrackingStore = defineStore('deliveryTracking', () => {
  const dataStore = useDataStore();
  const events = computed(() => dataStore.D.deliveryEvents);

  function eventsForOrder(orderId) {
    return events.value.filter(event => event.orderId === orderId || dataStore.timelineForOrder(orderId).some(item => item.id === event.id));
  }

  return { events, eventsForOrder };
});
