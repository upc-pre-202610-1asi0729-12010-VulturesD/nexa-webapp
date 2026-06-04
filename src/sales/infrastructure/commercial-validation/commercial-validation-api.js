import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class CommercialValidationApi {
  constructor() {
    this.requests = new BaseEndpoint('/api/v1/purchase-requests');
    this.orders = new BaseEndpoint('/api/v1/purchase-orders');
  }

  patchRequest(id, payload) { return this.requests.patch(id, payload); }
  createOrder(payload) { return this.orders.create(payload); }
}
