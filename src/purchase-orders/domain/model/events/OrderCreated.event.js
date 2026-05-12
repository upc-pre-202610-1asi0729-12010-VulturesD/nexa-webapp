import { DomainEvent } from '@/shared/domain/events/DomainEvent';

export class OrderCreated extends DomainEvent {
  constructor({ orderId, clientId, total = 0, occurredOn } = {}) {
    super({ aggregateId: orderId, occurredOn });
    this.clientId = clientId;
    this.total = total;
  }
}
