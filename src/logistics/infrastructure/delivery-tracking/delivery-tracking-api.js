import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class DeliveryTrackingApi {
  constructor() {
    this.deliveryEvents = new BaseEndpoint('/api/v1/delivery-events', undefined, { useCoreBackend: false, useMockApi: true });
    this.timelineEvents = new BaseEndpoint('/api/v1/order-timeline-events', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getDeliveryEvents() { return this.deliveryEvents.getAll(); }
  getTimelineEvents() { return this.timelineEvents.getAll(); }
}
