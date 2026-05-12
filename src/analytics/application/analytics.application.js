import { analyticsApiService } from '../infrastructure/analytics-api.service';

export const analyticsApplication = {
  getAlerts() {
    return analyticsApiService.getAlerts();
  },

  getActivityLog() {
    return analyticsApiService.getActivityLog();
  },
};
