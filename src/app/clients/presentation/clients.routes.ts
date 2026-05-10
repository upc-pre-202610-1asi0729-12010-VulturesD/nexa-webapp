import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/clients.page').then((m) => m.ClientsPage) },
];
