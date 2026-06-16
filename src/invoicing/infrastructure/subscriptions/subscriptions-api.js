import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class SubscriptionsApi {
  constructor() {
    this.subscriptions = new BaseEndpoint('/api/v1/subscriptions');
    this.tenants = new BaseEndpoint('/api/v1/tenants');
  }

  getSubscriptions() { return this.subscriptions.getAll(); }
  getTenants() { return this.tenants.getAll(); }
}
