export const dispatchOrdersRoutes = [
  {
    path: 'dispatch',
    name: 'ops.dispatch',
    component: () => import('@/dispatch-orders/presentation/views/DispatchView.vue'),
    meta: { roles: ['logistics', 'admin'] },
  },
];
