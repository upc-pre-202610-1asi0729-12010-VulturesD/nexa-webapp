<script setup>
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';

const { t } = useI18n();
const ds = useDataStore();
const D = ds.D;

const companyFields = [
  { labelKey: 'settings.fields.businessName', value: D.company.name },
  { labelKey: 'settings.fields.ruc',          value: D.company.ruc },
  { labelKey: 'settings.fields.address',      value: D.company.address },
  { labelKey: 'settings.fields.country',      value: D.company.country },
];
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.settings') }}</div>
    </div>
  </div>

  <div class="grid-2" style="align-items:start">
    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:16px">{{ t('settings.company') }}</div>
      <div v-for="f in companyFields" :key="f.labelKey" style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">{{ t(f.labelKey) }}</div>
        <div style="font-size:13px;color:#374151">{{ f.value }}</div>
      </div>
    </div>

    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:12px">{{ t('settings.users') }}</div>
      <div class="empty-state" style="padding:32px 20px">
        <div class="empty-state-icon"><i class="pi pi-lock"></i></div>
        <div class="empty-state-title">Acceso administrativo</div>
        <div class="empty-state-desc">La gestión de usuarios y roles es una función administrativa no incluida en el alcance TB1.</div>
      </div>
    </div>
  </div>
</template>
