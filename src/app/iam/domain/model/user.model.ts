import { RoleKey } from './role-key.model';

export type { RoleKey };

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  scope: string;
  roleKey: RoleKey;
  roleName: string;
  department: string;
  initials: string;
  clientId: string | null;
}
