import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./views/clients.page').then((m) => m.ClientsPage) },
  { path: ':id', loadComponent: () => import('./views/client-profile.page').then((m) => m.ClientProfilePage) },
];
