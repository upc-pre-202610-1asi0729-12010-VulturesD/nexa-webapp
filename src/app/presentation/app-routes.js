import { analyticsRoutes } from '@/analytics/presentation/analytics-routes';
import { clientsRoutes } from '@/clients/presentation/clients-routes';
import { dispatchOrdersRoutes } from '@/dispatch-orders/presentation/dispatch-orders-routes';
import { inventoryControlRoutes } from '@/inventory-control/presentation/inventory-control-routes';
import { productCatalogRoutes } from '@/product-catalog/presentation/product-catalog-routes';
import { purchaseOrdersRoutes } from '@/purchase-orders/presentation/purchase-orders-routes';

export const opsRoutes = {
  path: '/ops',
  component: () => import('@/app/presentation/layouts/OpsLayout.vue'),
  meta: { requiresAuth: true, scope: 'ops' },
  children: [
    { path: '', redirect: '/ops/dashboard' },
    { path: 'dashboard', name: 'ops.dashboard', component: () => import('@/app/presentation/views/ops/DashboardView.vue') },
    ...productCatalogRoutes,
    ...inventoryControlRoutes,
    ...purchaseOrdersRoutes,
    ...dispatchOrdersRoutes,
    ...clientsRoutes,
    ...analyticsRoutes,
    {
      path: 'settings',
      name: 'ops.settings',
      component: () => import('@/app/presentation/views/settings/SettingsView.vue'),
      meta: { roles: ['admin'] },
    },
    { path: 'profile', name: 'ops.profile', component: () => import('@/iam/presentation/views/ProfileView.vue') },
  ],
};

export const portalRoutes = {
  path: '/portal',
  component: () => import('@/app/presentation/layouts/PortalLayout.vue'),
  meta: { requiresAuth: true, scope: 'portal' },
  children: [
    { path: '', redirect: '/portal/home' },
    { path: 'home', name: 'portal.home', component: () => import('@/app/presentation/views/portal/PortalHomeView.vue') },
    { path: 'catalog', name: 'portal.catalog', component: () => import('@/app/presentation/views/portal/PortalCatalogView.vue') },
    { path: 'orders', name: 'portal.orders', component: () => import('@/app/presentation/views/portal/PortalOrdersView.vue') },
    {
      path: 'orders/success',
      name: 'portal.orders.success',
      component: () => import('@/app/presentation/views/portal/PortalOrderSuccessView.vue'),
    },
  ],
};
