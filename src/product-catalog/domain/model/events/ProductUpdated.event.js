import { DomainEvent } from '@/shared/domain/events/DomainEvent';

export class ProductUpdated extends DomainEvent {
  constructor({ productId, changedFields = [], occurredOn } = {}) {
    super({ aggregateId: productId, occurredOn });
    this.changedFields = changedFields;
  }
}
