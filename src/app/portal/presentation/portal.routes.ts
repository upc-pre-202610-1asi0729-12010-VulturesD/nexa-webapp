import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/portal.page').then((m) => m.PortalPage) },
];
