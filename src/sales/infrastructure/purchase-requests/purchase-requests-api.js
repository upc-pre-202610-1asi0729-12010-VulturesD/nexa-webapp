import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class PurchaseRequestsApi {
  constructor() {
    this.requests = new BaseEndpoint('/api/v1/purchase-requests', undefined, { useCoreBackend: false, useMockApi: true });
    this.items = new BaseEndpoint('/api/v1/request-items', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getRequests() { return this.requests.getAll(); }
  createRequest(payload) { return this.requests.create(payload); }
  patchRequest(id, payload) { return this.requests.patch(id, payload); }
  getItems() { return this.items.getAll(); }
}
