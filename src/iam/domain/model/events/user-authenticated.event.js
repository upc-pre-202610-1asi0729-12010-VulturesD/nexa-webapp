import { DomainEvent } from '@/shared/domain/events/domain-event';

export class UserAuthenticated extends DomainEvent {
  constructor({ userId, scope, roleKey, occurredOn } = {}) {
    super({ aggregateId: userId, occurredOn });
    this.scope = scope;
    this.roleKey = roleKey;
  }
}
