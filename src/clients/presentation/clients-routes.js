export const clientsRoutes = [
  {
    path: 'commercial/client-accounts',
    name: 'commercial-client-accounts',
    component: () => import('@/clients/presentation/views/clients-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'clients',
    redirect: '/ops/commercial/client-accounts',
  },
];
