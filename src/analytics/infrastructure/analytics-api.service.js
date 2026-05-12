import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

class AnalyticsApiService {
  constructor() {
    this.alerts = new BaseEndpoint('/alerts');
    this.activityLog = new BaseEndpoint('/activityLog');
  }

  getAlerts() {
    return this.alerts.getAll();
  }

  getActivityLog() {
    return this.activityLog.getAll();
  }
}

export const analyticsApiService = new AnalyticsApiService();
