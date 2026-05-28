import { DomainEvent } from '@/shared/domain/events/domain-event';

export class DeliveryClosed extends DomainEvent {
  constructor({ dispatchId, orderId, evidenceDone = true, occurredOn } = {}) {
    super({ aggregateId: dispatchId, occurredOn });
    this.orderId = orderId;
    this.evidenceDone = evidenceDone;
  }
}
