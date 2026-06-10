import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class ColdChainMonitoringApi {
  constructor() {
    this.temperatureLogs = new BaseEndpoint('/api/v1/temperature-logs', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getTemperatureLogs() { return this.temperatureLogs.getAll(); }
}
