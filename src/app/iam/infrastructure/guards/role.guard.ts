import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '@app/iam/application/iam.store';
import { RoleKey } from '@app/iam/domain/model/user.model';

export const roleGuard = (allowed: RoleKey[]): CanActivateFn => () => {
  const session = inject(IamStore);
  const router = inject(Router);
  const key = session.roleKey();
  if (key && allowed.includes(key)) return true;
  router.navigate([key === 'buyer' ? '/portal' : '/dashboard']);
  return false;
};
