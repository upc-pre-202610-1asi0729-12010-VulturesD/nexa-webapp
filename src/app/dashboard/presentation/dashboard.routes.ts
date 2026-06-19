import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const session = inject(IamStore);
      const role = session.roleKey();
      return role === 'logistics' ? '/dashboard/operations' : '/dashboard/commercial';
    }
  },
  {
    path: 'commercial',
    loadComponent: () => import('./views/commercial-dashboard.page').then((m) => m.CommercialDashboardPage)
  },
  {
    path: 'operations',
    loadComponent: () => import('./views/operations-dashboard.page').then((m) => m.OperationsDashboardPage)
  }
];
