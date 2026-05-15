export const commercialValidationRoutes = [
  {
    path: 'commercial/dashboard',
    name: 'ops.commercial.dashboard',
    component: () => import('@/commercial-validation/presentation/views/commercial-dashboard-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'commercial/purchase-requests/:id',
    name: 'commercial-purchase-request-detail',
    component: () => import('@/commercial-validation/presentation/views/commercial-validation-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'commercial/manual-order-entry',
    name: 'commercial-manual-order-entry',
    component: () => import('@/purchase-orders/presentation/views/create-order-view.vue'),
    meta: { roles: ['commercial'] },
  },
  { path: 'commercial/requests/:id', redirect: to => `/ops/commercial/purchase-requests/${to.params.id}` },
  { path: 'commercial/manual-order', redirect: '/ops/commercial/manual-order-entry' },
];
