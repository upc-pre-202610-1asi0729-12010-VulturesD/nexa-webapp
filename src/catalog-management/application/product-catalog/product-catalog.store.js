import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

export const useProductCatalogStore = defineStore('productCatalog', () => {
  const dataStore = useDataStore();
  const products = computed(() => dataStore.D.products);
  const buyerVisibleProducts = computed(() => products.value.filter(product => product.visibleToBuyer !== false && product.isVisibleToBuyer !== false));
  const categories = computed(() => dataStore.D.categories);

  return { products, buyerVisibleProducts, categories };
});
