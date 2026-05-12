import { defineStore } from 'pinia';
import { ref } from 'vue';
import { analyticsApplication } from './analytics.application';

export const useAnalyticsStore = defineStore('analytics', () => {
  const alerts = ref([]);
  const activityLog = ref([]);
  const loading = ref(false);

  async function loadAlerts() {
    loading.value = true;
    try {
      alerts.value = await analyticsApplication.getAlerts();
    } finally {
      loading.value = false;
    }
  }

  async function loadActivityLog() {
    loading.value = true;
    try {
      activityLog.value = await analyticsApplication.getActivityLog();
    } finally {
      loading.value = false;
    }
  }

  return { alerts, activityLog, loading, loadAlerts, loadActivityLog };
});
