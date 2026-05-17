export const subscriptionsRoutes = [
  {
    path: 'operations/company-administration',
    name: 'operations-company-administration',
    component: () => import('@/subscriptions/presentation/views/company-administration-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'company-administration',
    redirect: '/ops/operations/company-administration',
  },
];
