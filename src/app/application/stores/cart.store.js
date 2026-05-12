import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]); // [{ productId, qty, price, name, unit }]
  const isOpen = ref(false);

  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0));
  const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0));

  function add(product) {
    const existing = items.value.find(i => i.productId === product.id);
    if (existing) existing.qty += 1;
    else items.value.push({
      productId: product.id, qty: 1, price: product.price,
      name: product.name, unit: product.unit, sku: product.sku, cat: product.cat,
    });
  }
  function remove(productId) { items.value = items.value.filter(i => i.productId !== productId); }
  function setQty(productId, qty) {
    const it = items.value.find(i => i.productId === productId);
    if (!it) return;
    it.qty = Math.max(1, qty);
  }
  function clear() { items.value = []; }
  function toggle() { isOpen.value = !isOpen.value; }

  return { items, isOpen, count, total, add, remove, setQty, clear, toggle };
});
