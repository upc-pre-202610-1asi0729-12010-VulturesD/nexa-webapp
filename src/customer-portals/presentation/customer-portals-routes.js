export const customerPortalsRoutes = [
  {
    path: 'operations/customer-portals',
    name: 'operations-customer-portals',
    component: () => import('@/customer-portals/presentation/views/customer-portals-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'commercial/customer-portals',
    redirect: '/ops/operations/customer-portals',
  },
  {
    path: 'customer-portals',
    redirect: '/ops/operations/customer-portals',
  },
];
