import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class DeliveryTrackingApi {
  constructor() {
    this.deliveryEvents = new BaseEndpoint('/api/v1/delivery-events');
    this.timelineEvents = new BaseEndpoint('/api/v1/order-timeline-events');
  }

  getDeliveryEvents() { return this.deliveryEvents.getAll(); }
  getTimelineEvents() { return this.timelineEvents.getAll(); }
}
