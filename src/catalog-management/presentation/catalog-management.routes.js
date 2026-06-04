export const catalogManagementRoutes = [
  {
    path: 'product-catalog',
    name: 'ops-product-catalog',
    component: () => import('@/catalog-management/presentation/product-catalog/views/catalog-view.vue'),
    meta: { roles: ['commercial'] },
  },
  {
    path: 'operations/promotions',
    name: 'operations-promotions',
    component: () => import('@/catalog-management/presentation/promotions/views/promotions-manager-view.vue'),
    meta: { roles: ['logistics'] },
  },
  { path: 'catalog', redirect: '/ops/product-catalog' },
  { path: 'commercial/promotions', redirect: '/ops/operations/promotions' },
];

export const catalogManagementPortalRoutes = [
  {
    path: 'product-catalog',
    name: 'buyer-product-catalog',
    component: () => import('@/catalog-management/presentation/product-catalog/views/buyer-catalog-view.vue'),
  },
  {
    path: 'product-catalog/:id',
    name: 'buyer-product-catalog-detail',
    component: () => import('@/catalog-management/presentation/product-catalog/views/buyer-product-detail-view.vue'),
  },
  { path: 'catalog', redirect: '/portal/product-catalog' },
  { path: 'catalog/:id', redirect: to => `/portal/product-catalog/${to.params.id}` },
];
