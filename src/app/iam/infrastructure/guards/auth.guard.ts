import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';

export const authGuard: CanActivateFn = () => {
  const session = inject(IamStore);
  const router = inject(Router);
  if (session.isAuthenticated()) return true;
  return router.parseUrl('/login');
};
