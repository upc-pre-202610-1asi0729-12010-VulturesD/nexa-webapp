import { analyticsApiService } from '../infrastructure/analytics-api';

export const analyticsApplication = {
  getAlerts() {
    return analyticsApiService.getAlerts();
  },

  getActivityLog() {
    return analyticsApiService.getActivityLog();
  },
};
