export const sharedRoutes = [
  {
    path: 'operations/operational-analytics',
    name: 'operations-operational-analytics',
    component: () => import('@/shared/presentation/analytics/views/operational-analytics-view.vue'),
    meta: { roles: ['logistics'] },
  },
  { path: 'reports', redirect: '/ops/operations/operational-analytics' },
];
