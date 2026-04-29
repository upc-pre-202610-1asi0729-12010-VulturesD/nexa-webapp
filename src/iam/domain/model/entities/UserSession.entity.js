import { Entity } from '@/shared/domain/model/Entity';

export class UserSession extends Entity {
  constructor({ id, userId, scope, token, issuedAt = new Date(), expiresAt = null } = {}) {
    super({ id });
    this.userId = userId;
    this.scope = scope;
    this.token = token;
    this.issuedAt = issuedAt instanceof Date ? issuedAt : new Date(issuedAt);
    this.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  isActive(reference = new Date()) {
    return Boolean(this.token) && (!this.expiresAt || this.expiresAt > reference);
  }

  belongsToScope(scope) {
    return this.scope === scope;
  }
}
