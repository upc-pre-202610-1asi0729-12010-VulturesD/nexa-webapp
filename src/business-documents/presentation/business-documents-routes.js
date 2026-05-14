export const businessDocumentsRoutes = [
  {
    path: 'commercial/business-documents',
    name: 'commercial-business-documents',
    component: () => import('@/business-documents/presentation/views/business-documents-center-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'operations/business-documents',
    name: 'operations-business-documents',
    component: () => import('@/business-documents/presentation/views/business-documents-center-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'commercial/documents',
    redirect: '/ops/commercial/business-documents',
  },
];
