import { RoleKey } from '../model/role-key.model';

export interface RoleAssignedEvent {
  readonly kind: 'RoleAssigned';
  readonly userId: string;
  readonly roleKey: RoleKey;
  readonly at: string;
}
