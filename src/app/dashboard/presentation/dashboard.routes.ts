import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/dashboard.page').then((m) => m.DashboardPage) },
];
