<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-clock' },
});

const { t } = useI18n();
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">{{ title }}</div>
        <div class="page-subtitle">{{ description || t('common.pendingBackendDesc') }}</div>
      </div>
    </div>
    <section class="flow-panel">
      <div class="flow-panel-pad">
        <div class="empty-state">
          <div class="empty-state-icon"><i :class="icon"></i></div>
          <div class="empty-state-title">{{ t('common.pendingBackendTitle') }}</div>
          <div class="empty-state-desc">{{ t('common.pendingBackendDesc') }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
