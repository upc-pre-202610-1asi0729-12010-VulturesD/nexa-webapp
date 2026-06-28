import { Routes } from '@angular/router';

export const ORDERING_ROUTES: Routes = [
  { path: 'new', loadComponent: () => import('./views/order-new.page').then((m) => m.OrderNewPage) },
  { path: ':id', loadComponent: () => import('./views/order-detail.page').then((m) => m.OrderDetailPage) },
  { path: '', loadComponent: () => import('./views/orders.page').then((m) => m.OrdersPage) },
];
