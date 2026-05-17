import { analyticsRoutes } from '@/analytics/presentation/analytics-routes';
import { buyerPortalRoutes } from '@/buyer-portal/presentation/buyer-portal-routes';
import { clientsRoutes } from '@/clients/presentation/clients-routes';
import { commercialValidationRoutes } from '@/commercial-validation/presentation/commercial-validation-routes';
import { customerPortalsRoutes } from '@/customer-portals/presentation/customer-portals-routes';
import { dispatchOrdersRoutes } from '@/dispatch-orders/presentation/dispatch-orders-routes';
import { businessDocumentsRoutes } from '@/business-documents/presentation/business-documents-routes';
import { inventoryControlRoutes } from '@/inventory-control/presentation/inventory-control-routes';
import { productCatalogRoutes, productCatalogPortalRoutes } from '@/product-catalog/presentation/product-catalog-routes';
import { promotionsRoutes } from '@/promotions/presentation/promotions-routes';
import { purchaseOrdersRoutes } from '@/purchase-orders/presentation/purchase-orders-routes';
import { purchaseRequestsRoutes } from '@/purchase-requests/presentation/purchase-requests-routes';
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
    ...commercialValidationRoutes,
    ...purchaseRequestsRoutes,
    ...businessDocumentsRoutes,
    ...promotionsRoutes,
    ...customerPortalsRoutes,
    ...productCatalogRoutes,
    ...inventoryControlRoutes,
    ...purchaseOrdersRoutes,
    ...dispatchOrdersRoutes,
    ...clientsRoutes,
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
    ...buyerPortalRoutes,
    ...productCatalogPortalRoutes,
  ],
};
