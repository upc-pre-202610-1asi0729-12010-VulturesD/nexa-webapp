import { Entity } from '@/shared/domain/model/Entity';
import { RoleKey } from '../value-objects/RoleKey.value-object';

export class User extends Entity {
  constructor({
    id,
    name,
    email,
    scope = 'ops',
    roleKey = 'commercial',
    roleName = '',
    department = '',
    initials = '',
    clientId = null,
  } = {}) {
    super({ id });
    this.name = name;
    this.email = email;
    this.scope = scope;
    this.roleKey = new RoleKey(roleKey);
    this.roleName = roleName;
    this.department = department;
    this.initials = initials;
    this.clientId = clientId;
  }

  canAccessScope(scope) {
    return this.scope === scope;
  }

  isPortalBuyer() {
    return this.scope === 'portal' && this.roleKey.value === 'buyer';
  }

  canManageInventory() {
    return this.roleKey.canManageInventory();
  }
}
