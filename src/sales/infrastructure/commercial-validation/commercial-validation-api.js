import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { baseApi } from '@/shared/infrastructure/base-api';

export class CommercialValidationApi {
  constructor() {
    this.requests = new BaseEndpoint('/api/v1/purchase-requests', baseApi, { useCoreBackend: false, useMockApi: true });
    this.orders = new BaseEndpoint('/api/v1/orders', baseApi, { useCoreBackend: true });
  }

  patchRequest(id, payload) { return this.requests.patch(id, payload); }
  createOrder(payload) { return this.orders.create(payload); }
}
