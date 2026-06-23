import { RoleKey } from './role-key.model';

export interface AuthSession {
  readonly userId: string;
  readonly email: string;
  readonly roleKey: RoleKey;
  readonly issuedAt: string;
}
