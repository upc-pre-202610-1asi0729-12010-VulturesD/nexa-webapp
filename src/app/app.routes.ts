import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { authGuard } from '@app/iam/infrastructure/guards/auth.guard';
import { roleGuard } from '@app/iam/infrastructure/guards/role.guard';
import { IamStore } from '@app/iam/application/iam.store';

const homeRedirect: CanActivateFn = () => {
  const session = inject(IamStore);
  const router = inject(Router);
  const role = session.roleKey();
  router.navigate([role === 'buyer' ? '/portal' : '/dashboard']);
  return false;
};

export const appRoutes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@app/iam/presentation/iam.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@app/shared/presentation/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirect], children: [] },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/dashboard/presentation/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'products',
        canActivate: [roleGuard(['commercial', 'buyer', 'logistics'])],
        loadChildren: () => import('@app/catalog/presentation/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'clients',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/clients/presentation/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: 'orders',
        canActivate: [roleGuard(['commercial', 'logistics', 'buyer'])],
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
        path: 'portal',
        canActivate: [roleGuard(['buyer'])],
        loadChildren: () => import('@app/portal/presentation/portal.routes').then((m) => m.PORTAL_ROUTES),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['commercial', 'logistics'])],
        loadChildren: () => import('@app/iam/presentation/iam.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  { path: 'catalog', pathMatch: 'full', redirectTo: 'products' },
  { path: 'dispatch', pathMatch: 'full', redirectTo: 'dispatches' },
  { path: 'create-order', pathMatch: 'full', redirectTo: 'orders/new' },
  { path: 'ops/dashboard', redirectTo: 'dashboard' },
  { path: 'ops/catalog', redirectTo: 'products' },
  { path: 'ops/orders/new', redirectTo: 'orders/new' },
  { path: 'ops/orders/:id', redirectTo: 'orders/:id' },
  { path: 'ops/orders', redirectTo: 'orders' },
  { path: 'ops/clients', redirectTo: 'clients' },
  { path: 'ops/inventory', redirectTo: 'inventory' },
  { path: 'ops/dispatch', redirectTo: 'dispatches' },
  { path: 'ops/reports', redirectTo: 'reports' },
  { path: 'ops/profile', redirectTo: 'profile' },
  { path: '**', redirectTo: '' },
];
