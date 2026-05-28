export const analyticsRoutes = [
  {
    path: 'operations/operational-analytics',
    name: 'operations-operational-analytics',
    component: () => import('@/analytics/presentation/views/operational-analytics-view.vue'),
    meta: { roles: ['logistics'] },
  },
  { path: 'reports', redirect: '/ops/operations/operational-analytics' },
];
