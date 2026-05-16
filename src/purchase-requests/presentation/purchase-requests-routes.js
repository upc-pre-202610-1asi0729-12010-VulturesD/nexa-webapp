export const purchaseRequestsRoutes = [
  // #1 Canonical route: purchase requests are not final purchase orders.
  {
    path: 'commercial/purchase-requests',
    name: 'commercial-purchase-requests',
    component: () => import('@/purchase-requests/presentation/views/request-inbox-view.vue'),
    meta: { roles: ['commercial'] },
  },
  { path: 'commercial/requests', redirect: '/ops/commercial/purchase-requests' },
];
