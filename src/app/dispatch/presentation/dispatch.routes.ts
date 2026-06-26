import { Routes } from '@angular/router';

export const DISPATCH_ROUTES: Routes = [
  { path: ':id', loadComponent: () => import('./views/dispatch-detail.page').then((m) => m.DispatchDetailPage) },
  { path: '', loadComponent: () => import('./views/dispatches.page').then((m) => m.DispatchesPage) },
];
