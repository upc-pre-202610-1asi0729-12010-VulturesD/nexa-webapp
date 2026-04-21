import { RoleKey } from '../model/role-key.model';

export interface UserLoggedInEvent {
  readonly kind: 'UserLoggedIn';
  readonly userId: string;
  readonly email: string;
  readonly roleKey: RoleKey;
  readonly at: string;
}
