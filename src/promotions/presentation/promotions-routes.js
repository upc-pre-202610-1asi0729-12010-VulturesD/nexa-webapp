export const promotionsRoutes = [
  {
    path: 'operations/promotions',
    name: 'operations-promotions',
    component: () => import('@/promotions/presentation/views/promotions-manager-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'commercial/promotions',
    redirect: '/ops/operations/promotions',
  },
];
