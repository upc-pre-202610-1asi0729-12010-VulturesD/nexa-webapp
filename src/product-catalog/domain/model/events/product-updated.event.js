import { DomainEvent } from '@/shared/domain/events/domain-event';

export class ProductUpdated extends DomainEvent {
  constructor({ productId, changedFields = [], occurredOn } = {}) {
    super({ aggregateId: productId, occurredOn });
    this.changedFields = changedFields;
  }
}
