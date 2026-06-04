import { analyticsRoutes } from '@/analytics/presentation/analytics-routes';
import { salesRoutes, salesPortalRoutes } from '@/sales/presentation/sales.routes';
import { logisticsRoutes } from '@/logistics/presentation/logistics.routes';
import { businessDocumentsRoutes } from '@/business-documents/presentation/business-documents-routes';
import { warehouseRoutes } from '@/warehouse/presentation/warehouse.routes';
import { catalogManagementRoutes, catalogManagementPortalRoutes } from '@/catalog-management/presentation/catalog-management.routes';
import { subscriptionsRoutes } from '@/subscriptions/presentation/subscriptions-routes';

export const opsRoutes = {
  path: '/ops',
  component: () => import('@/app/presentation/layouts/ops-layout.vue'),
  meta: { requiresAuth: true, scope: 'ops' },
  children: [
    { path: '', redirect: '/ops/dashboard' },
    {
      path: 'dashboard',
      name: 'ops.dashboard',
      redirect: () => {
        const user = JSON.parse(localStorage.getItem('nexa.user') || 'null');
        return user?.roleKey === 'logistics' ? '/ops/operations/dashboard' : '/ops/commercial/dashboard';
      },
    },
    // #2 Legacy aliases keep older demo links working while menus use canonical domain routes.
    { path: 'commercial/orders', redirect: '/ops/commercial/purchase-orders' },
    { path: 'commercial/orders/create', redirect: '/ops/commercial/manual-order-entry' },
    { path: 'commercial/orders/:id', redirect: to => `/ops/commercial/purchase-orders/${to.params.id}` },
    ...salesRoutes,
    ...businessDocumentsRoutes,
    ...catalogManagementRoutes,
    ...warehouseRoutes,
    ...logisticsRoutes,
    ...analyticsRoutes,
    ...subscriptionsRoutes,
    {
      path: 'settings',
      redirect: '/ops/operations/company-administration',
    },
    { path: 'profile', name: 'ops.profile', component: () => import('@/iam/presentation/views/profile-view.vue') },
  ],
};

export const portalRoutes = {
  path: '/portal',
  component: () => import('@/app/presentation/layouts/portal-layout.vue'),
  meta: { requiresAuth: true, scope: 'portal' },
  children: [
    { path: '', redirect: '/portal/home' },
    ...salesPortalRoutes,
    ...catalogManagementPortalRoutes,
  ],
};
