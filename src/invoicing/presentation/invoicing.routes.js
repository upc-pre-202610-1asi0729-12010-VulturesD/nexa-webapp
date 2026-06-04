export const invoicingRoutes = [
  {
    path: 'commercial/business-documents',
    name: 'commercial-business-documents',
    component: () => import('@/invoicing/presentation/business-documents/views/business-documents-center-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'operations/business-documents',
    name: 'operations-business-documents',
    component: () => import('@/invoicing/presentation/business-documents/views/business-documents-center-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'operations/company-administration',
    name: 'operations-company-administration',
    component: () => import('@/invoicing/presentation/subscriptions/views/company-administration-view.vue'),
    meta: { roles: ['logistics'] },
  },
  {
    path: 'commercial/documents',
    redirect: '/ops/commercial/business-documents',
  },
  {
    path: 'company-administration',
    redirect: '/ops/operations/company-administration',
  },
];
