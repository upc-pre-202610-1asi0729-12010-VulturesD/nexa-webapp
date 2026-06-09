import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class SubscriptionsApi {
  constructor() {
    this.subscriptions = new BaseEndpoint('/api/v1/subscriptions', undefined, { useCoreBackend: false, useMockApi: true });
    this.tenants = new BaseEndpoint('/api/v1/tenants', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getSubscriptions() { return this.subscriptions.getAll(); }
  getTenants() { return this.tenants.getAll(); }
}
