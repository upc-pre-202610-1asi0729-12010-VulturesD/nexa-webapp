export const purchaseOrdersRoutes = [
  {
    path: 'commercial/purchase-orders',
    name: 'commercial-purchase-orders',
    component: () => import('@/purchase-orders/presentation/views/orders-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'commercial/purchase-orders/:id',
    name: 'commercial-purchase-order-detail',
    component: () => import('@/purchase-orders/presentation/views/order-detail-view.vue'),
    meta: { roles: ['commercial'] },
  },
  { path: 'orders', redirect: '/ops/commercial/purchase-orders' },
  { path: 'orders/new', redirect: '/ops/commercial/manual-order-entry' },
  { path: 'orders/:id', redirect: to => `/ops/commercial/purchase-orders/${to.params.id}` },
];
