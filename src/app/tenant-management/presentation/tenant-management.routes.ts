import { Routes } from '@angular/router';

export const TENANT_MANAGEMENT_PUBLIC_ROUTES: Routes = [
  { path: 'register-organization', loadComponent: () => import('./views/register-organization.page').then((m) => m.RegisterOrganizationPage) },
  { path: 'registration-pending/:id', loadComponent: () => import('./views/registration-pending.page').then((m) => m.RegistrationPendingPage) },
];
