import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

class AnalyticsApiService {
  constructor() {
    this.alerts = new BaseEndpoint('/api/v1/alerts', undefined, { useCoreBackend: false, useMockApi: true });
    this.activityLog = new BaseEndpoint('/api/v1/activity-log', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getAlerts() {
    return this.alerts.getAll();
  }

  getActivityLog() {
    return this.activityLog.getAll();
  }
}

export const analyticsApiService = new AnalyticsApiService();
