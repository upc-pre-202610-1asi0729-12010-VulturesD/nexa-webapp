import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class BuyerPortalApi {
  constructor() {
    this.clients = new BaseEndpoint('/api/v1/clients');
    this.requests = new BaseEndpoint('/api/v1/purchase-requests');
    this.orders = new BaseEndpoint('/api/v1/purchase-orders');
    this.documents = new BaseEndpoint('/api/v1/business-documents');
  }

  getClients() { return this.clients.getAll(); }
  getRequests() { return this.requests.getAll(); }
  getOrders() { return this.orders.getAll(); }
  getDocuments() { return this.documents.getAll(); }
}
