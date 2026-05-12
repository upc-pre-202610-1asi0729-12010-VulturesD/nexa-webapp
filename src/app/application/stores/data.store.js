import { defineStore } from 'pinia';
import { ref } from 'vue';
import { analyticsApplication } from '@/analytics/application/analytics.application';
import { catalogApplication } from '@/product-catalog/application/catalog.application';
import { inventoryApplication } from '@/inventory-control/application/inventory.application';
import { customersApplication } from '@/clients/application/customers.application';
import { ordersApplication } from '@/purchase-orders/application/orders.application';
import { dispatchApplication } from '@/dispatch-orders/application/dispatch.application';

/**
 * Central store for runtime data.
 * Loads business data from the configured Fake API, with local server fallback in shared infrastructure.
 */
export const useDataStore = defineStore('data', () => {
  const D = ref({
    company:   { name: '', ruc: '', address: '', country: '' },
    user:      { name: '', role: '', initials: '', email: '' },
    warehouses: [],
    products:  [],
    categories: [],
    lots:      [],
    movements: [],
    clients:   [],
    orders:    [],
    dispatches: [],
    alerts:    [],
    activity:  [],
  });

  function clientName(id)  { return (D.value.clients.find(c => c.id === id) || {}).name || id; }
  function productName(id) { return (D.value.products.find(p => p.id === id) || {}).name || id; }
  function productById(id) { return D.value.products.find(p => p.id === id); }
  function clientById(id)  { return D.value.clients.find(c => c.id === id); }
  function orderById(id)   { return D.value.orders.find(o => o.id === id); }

  function nextOrderId() {
    const nums = D.value.orders
      .map(o => parseInt(o.id.split('-').pop(), 10))
      .filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 412;
    return `ORD-2026-${String(max + 1).padStart(4, '0')}`;
  }

  function addOrder(order) {
    D.value.orders.unshift(order);
    ordersApplication.createOrder(order).catch(() => {});
  }

  async function init() {
    try {
      const [products, clients, orders, lots, movements, dispatches, warehouses] = await Promise.all([
        catalogApplication.getProducts(),
        customersApplication.getClients(),
        ordersApplication.getOrders(),
        inventoryApplication.getLots(),
        inventoryApplication.getMovements(),
        dispatchApplication.getDispatches(),
        inventoryApplication.getWarehouses(),
      ]);
      D.value.products   = products;
      D.value.categories = await catalogApplication.getCategories();
      D.value.clients    = clients;
      D.value.orders     = orders;
      D.value.lots       = lots;
      D.value.movements  = movements;
      D.value.dispatches = dispatches;
      D.value.warehouses = warehouses;
      const [alerts, activity] = await Promise.all([
        analyticsApplication.getAlerts(),
        analyticsApplication.getActivityLog(),
      ]);
      D.value.alerts = alerts;
      D.value.activity = activity;
    } catch {
      // Keep empty state if cloud and local Fake API are unavailable.
    }
  }

  init();

  return { D, clientName, productName, productById, clientById, orderById, nextOrderId, addOrder };
});
