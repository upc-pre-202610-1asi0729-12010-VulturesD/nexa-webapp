import { DomainEvent } from '@/shared/domain/events/domain-event';

export class OrderCreated extends DomainEvent {
  constructor({ orderId, clientId, total = 0, occurredOn } = {}) {
    super({ aggregateId: orderId, occurredOn });
    this.clientId = clientId;
    this.total = total;
  }
}
