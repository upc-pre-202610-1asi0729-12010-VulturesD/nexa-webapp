import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/analytics.page').then((m) => m.AnalyticsPage) },
];

export const REPORTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/reports.page').then((m) => m.ReportsPage) },
];
