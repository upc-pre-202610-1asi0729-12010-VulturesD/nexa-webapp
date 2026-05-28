export const dispatchOrdersRoutes = [
  {
    path: 'operations/dashboard',
    name: 'ops.operations.dashboard',
    component: () => import('@/dispatch-orders/presentation/views/operations-dashboard-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/dispatch-orders',
    name: 'operations-dispatch-orders',
    component: () => import('@/dispatch-orders/presentation/views/dispatch-board-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/dispatch-orders/:id',
    name: 'operations-dispatch-order-detail',
    component: () => import('@/dispatch-orders/presentation/views/dispatch-detail-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/proof-of-delivery',
    name: 'operations-proof-of-delivery',
    component: () => import('@/dispatch-orders/presentation/views/evidence-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'dispatch',
    redirect: '/ops/operations/dispatch-orders',
  },
  {
    path: 'dispatch/:id',
    redirect: to => `/ops/operations/dispatch-orders/${to.params.id}`,
  },
  {
    path: 'evidence',
    redirect: '/ops/operations/proof-of-delivery',
  },
];
