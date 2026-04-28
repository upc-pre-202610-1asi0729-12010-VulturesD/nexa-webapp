export class DomainEvent {
  constructor({ aggregateId, occurredOn = new Date(), eventName } = {}) {
    if (!aggregateId) {
      throw new Error('DomainEvent requires aggregateId');
    }

    this.aggregateId = aggregateId;
    this.occurredOn = occurredOn;
    this.eventName = eventName || this.constructor.name;
  }

  toPrimitives() {
    return {
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn.toISOString(),
      eventName: this.eventName,
    };
  }
}
