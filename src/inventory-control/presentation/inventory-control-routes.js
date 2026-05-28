export const inventoryControlRoutes = [
  {
    path: 'operations/inventory-control',
    name: 'operations-inventory-control',
    component: () => import('@/inventory-control/presentation/views/inventory-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/inventory-lots',
    name: 'operations-inventory-lots',
    component: () => import('@/inventory-control/presentation/views/inventory-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'inventory',
    redirect: '/ops/operations/inventory-control',
  },
];
