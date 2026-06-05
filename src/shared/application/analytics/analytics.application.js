import { analyticsApiService } from '../../infrastructure/analytics/analytics-api';

export const analyticsApplication = {
  getAlerts() {
    return analyticsApiService.getAlerts();
  },

  getActivityLog() {
    return analyticsApiService.getActivityLog();
  },
};
