export const warehouseRoutes = [
  {
    path: 'operations/inventory-control',
    name: 'operations-inventory-control',
    component: () => import('@/warehouse/presentation/inventory-control/views/inventory-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/inventory-lots',
    name: 'operations-inventory-lots',
    component: () => import('@/warehouse/presentation/inventory-control/views/inventory-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'inventory',
    redirect: '/ops/operations/inventory-control',
  },
];
