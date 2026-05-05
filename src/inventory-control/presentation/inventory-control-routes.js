export const inventoryControlRoutes = [
  {
    path: 'inventory',
    name: 'ops.inventory',
    component: () => import('@/inventory-control/presentation/views/InventoryView.vue'),
    meta: { roles: ['logistics', 'admin'] },
  },
];
