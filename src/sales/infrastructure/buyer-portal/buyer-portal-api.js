import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { baseApi } from '@/shared/infrastructure/base-api';

export class BuyerPortalApi {
  constructor() {
    this.clients = new BaseEndpoint('/api/v1/clients', baseApi, { useCoreBackend: false, useMockApi: true });
    this.requests = new BaseEndpoint('/api/v1/purchase-requests', baseApi, { useCoreBackend: false, useMockApi: true });
    this.orders = new BaseEndpoint('/api/v1/orders', baseApi, { useCoreBackend: true });
    this.documents = new BaseEndpoint('/api/v1/invoices', baseApi, { useCoreBackend: true });
  }

  getClients() { return this.clients.getAll(); }
  getRequests() { return this.requests.getAll(); }
  getOrders() { return this.orders.getAll(); }
  getDocuments() { return this.documents.getAll(); }
}
