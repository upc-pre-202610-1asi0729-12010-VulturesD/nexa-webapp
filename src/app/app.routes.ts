import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { authGuard } from '@app/iam/infrastructure/guards/auth.guard';
import { roleGuard } from '@app/iam/infrastructure/guards/role.guard';
import { IamStore } from '@app/iam/application/iam.store';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadChildren: () => import('@app/iam/presentation/iam.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('@app/iam/presentation/iam.routes').then((m) => m.IAM_PUBLIC_ROUTES),
  },
  {
    path: 'tenant-management',
    loadChildren: () => import('@app/tenant-management/presentation/tenant-management.routes').then((m) => m.TENANT_MANAGEMENT_PUBLIC_ROUTES),
  },
  {
    path: 'portal',
    canActivate: [authGuard, roleGuard(['buyer'])],
    loadChildren: () => import('@app/portal/presentation/portal.routes').then((m) => m.PORTAL_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@app/shared/presentation/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/dashboard/presentation/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'commercial/business-documents/orders/:orderId',
        canActivate: [roleGuard(['commercial'])],
        loadComponent: () => import('@app/invoicing/presentation/views/business-document-order-detail.page').then((m) => m.BusinessDocumentOrderDetailPage),
      },
      {
        path: 'commercial/business-documents',
        canActivate: [roleGuard(['commercial'])],
        loadComponent: () => import('@app/invoicing/presentation/views/business-documents-center.page').then((m) => m.BusinessDocumentsCenterPage),
      },
      {
        path: 'commercial/purchase-requests/:id',
        canActivate: [roleGuard(['commercial'])],
        loadComponent: () => import('./ordering/presentation/views/commercial-validation.page').then((m) => m.CommercialValidationPage),
      },
      {
        path: 'commercial/purchase-requests',
        canActivate: [roleGuard(['commercial'])],
        loadComponent: () => import('./ordering/presentation/views/purchase-requests.page').then((m) => m.PurchaseRequestsPage),
      },
      {
        path: 'operations/business-documents/orders/:orderId',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/invoicing/presentation/views/business-document-order-detail.page').then((m) => m.BusinessDocumentOrderDetailPage),
      },
      {
        path: 'operations/business-documents',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/invoicing/presentation/views/business-documents-center.page').then((m) => m.BusinessDocumentsCenterPage),
      },
      {
        path: 'operations/promotions',
        canActivate: [roleGuard(['logistics', 'owner'])],
        loadComponent: () => import('./dashboard/presentation/views/promotions-manager.page').then((m) => m.PromotionsManagerPage),
      },
      {
        path: 'operations/company-administration',
        canActivate: [roleGuard(['owner'])],
        loadComponent: () => import('./dashboard/presentation/views/company-administration.page').then((m) => m.CompanyAdministrationPage),
      },
      {
        path: 'settings',
        pathMatch: 'full',
        redirectTo: 'operations/company-administration',
      },
      {
        path: 'operations/workspace-setup',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/tenant-management/presentation/views/workspace-setup.page').then((m) => m.WorkspaceSetupPage),
      },
      {
        path: 'operations/workspace-profile',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/tenant-management/presentation/views/workspace-profile.page').then((m) => m.WorkspaceProfilePage),
      },
      {
        path: 'products',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/catalog/presentation/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'clients',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/clients/presentation/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: 'orders',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/ordering/presentation/ordering.routes').then((m) => m.ORDERING_ROUTES),
      },
      {
        path: 'inventory',
        canActivate: [roleGuard(['logistics'])],
        loadChildren: () => import('@app/inventory/presentation/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'stock-movements',
        canActivate: [roleGuard(['logistics'])],
        loadChildren: () => import('@app/inventory/presentation/inventory.routes').then((m) => m.STOCK_MOVEMENTS_ROUTES),
      },
      {
        path: 'dispatches',
        canActivate: [roleGuard(['logistics'])],
        loadChildren: () => import('@app/dispatch/presentation/dispatch.routes').then((m) => m.DISPATCH_ROUTES),
      },
      {
        path: 'proof-of-delivery',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/dispatch/presentation/views/proof-of-delivery.page').then((m) => m.ProofOfDeliveryPage),
      },
      {
        path: 'customer-portals',
        canActivate: [roleGuard(['logistics'])],
        loadComponent: () => import('@app/dispatch/presentation/views/customer-portals.page').then((m) => m.CustomerPortalsPage),
      },
      {
        path: 'analytics',
        canActivate: [roleGuard(['logistics', 'commercial'])],
        loadChildren: () => import('@app/analytics/presentation/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
      },
      {
        path: 'reports',
        canActivate: [roleGuard(['logistics', 'commercial'])],
        loadChildren: () => import('@app/analytics/presentation/analytics.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['owner', 'commercial', 'logistics', 'viewer'])],
        loadChildren: () => import('@app/iam/presentation/iam.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  { path: 'catalog', pathMatch: 'full', redirectTo: 'products' },
  { path: 'dispatch', pathMatch: 'full', redirectTo: 'dispatches' },
  { path: 'create-order', pathMatch: 'full', redirectTo: 'orders/new' },
  { path: 'ops/dashboard', redirectTo: 'dashboard' },
  { path: 'ops/catalog', redirectTo: 'products' },
  { path: 'ops/product-catalog', redirectTo: 'products' },
  { path: 'ops/orders/new', redirectTo: 'orders/new' },
  { path: 'ops/orders/:id', redirectTo: 'orders/:id' },
  { path: 'ops/orders', redirectTo: 'orders' },
  { path: 'ops/clients', redirectTo: 'clients' },
  { path: 'ops/commercial/client-accounts/:id', redirectTo: 'clients/:id' },
  { path: 'ops/inventory', redirectTo: 'inventory' },
  { path: 'ops/dispatch', redirectTo: 'dispatches' },
  { path: 'ops/commercial/purchase-requests/:id', redirectTo: 'commercial/purchase-requests/:id' },
  { path: 'ops/commercial/purchase-requests', redirectTo: 'commercial/purchase-requests' },
  { path: 'ops/commercial/purchase-orders', redirectTo: 'orders' },
  { path: 'ops/commercial/manual-order-entry', redirectTo: 'orders/new' },
  { path: 'ops/commercial/client-accounts', redirectTo: 'clients' },
  { path: 'ops/commercial/business-documents/orders/:orderId', redirectTo: 'commercial/business-documents/orders/:orderId' },
  { path: 'ops/commercial/business-documents', redirectTo: 'commercial/business-documents' },
  { path: 'ops/operations/inventory-control', redirectTo: 'inventory' },
  { path: 'ops/operations/dispatch-orders', redirectTo: 'dispatches' },
  { path: 'ops/operations/dispatch-orders/:id', redirectTo: 'dispatches/:id' },
  { path: 'ops/operations/proof-of-delivery', redirectTo: 'proof-of-delivery' },
  { path: 'ops/operations/operational-analytics', redirectTo: 'analytics' },
  { path: 'ops/operations/business-documents/orders/:orderId', redirectTo: 'operations/business-documents/orders/:orderId' },
  { path: 'ops/operations/business-documents', redirectTo: 'operations/business-documents' },
  { path: 'ops/operations/promotions', redirectTo: 'operations/promotions' },
  { path: 'ops/operations/customer-portals', redirectTo: 'customer-portals' },
  { path: 'ops/operations/company-administration', redirectTo: 'operations/company-administration' },
  { path: 'ops/settings', redirectTo: 'operations/company-administration' },
  { path: 'ops/operations/workspace-setup', redirectTo: 'operations/workspace-setup' },
  { path: 'ops/operations/workspace-profile', redirectTo: 'operations/workspace-profile' },
  { path: 'ops/reports', redirectTo: 'reports' },
  { path: 'ops/profile', redirectTo: 'profile' },
  { path: '**', redirectTo: '' },
];
