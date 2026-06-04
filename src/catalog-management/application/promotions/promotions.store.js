import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const usePromotionsStore = defineStore('promotions', () => {
  const dataStore = useDataStore();
  const promotions = computed(() => dataStore.D.promotions);
  const activePromotions = computed(() => promotions.value.filter(promotion => promotion.status === 'active'));

  function createPromotion(payload) {
    return dataStore.addPromotion(payload);
  }

  return { promotions, activePromotions, createPromotion };
});
