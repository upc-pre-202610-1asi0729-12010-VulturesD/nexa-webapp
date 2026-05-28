export const productCatalogRoutes = [
  {
    path: 'product-catalog',
    name: 'ops-product-catalog',
    component: () => import('@/product-catalog/presentation/views/catalog-view.vue'),
    meta: { roles: ['commercial'] },
  },
  { path: 'catalog', redirect: '/ops/product-catalog' },
];

export const productCatalogPortalRoutes = [
  {
    path: 'product-catalog',
    name: 'buyer-product-catalog',
    component: () => import('@/product-catalog/presentation/views/buyer-catalog-view.vue'),
  },
  {
    path: 'product-catalog/:id',
    name: 'buyer-product-catalog-detail',
    component: () => import('@/product-catalog/presentation/views/buyer-product-detail-view.vue'),
  },
  { path: 'catalog', redirect: '/portal/product-catalog' },
  { path: 'catalog/:id', redirect: to => `/portal/product-catalog/${to.params.id}` },
];
