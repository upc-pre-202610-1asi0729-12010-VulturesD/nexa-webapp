<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { orderStatusLabel, orderStatusBadge, priorityLabel, daysUntil } from '@/shared/status';

const { t, locale } = useI18n();
const router = useRouter();
const ds = useDataStore();
const auth = useAuthStore();
const D = ds.D;
const alertsOpen = ref(true);

const roleKey = computed(() => auth.user?.roleKey || 'commercial');
const isLogistics = computed(() => roleKey.value === 'logistics');

const pendingOrders = computed(() => D.orders.filter(o => ['validating', 'blocked'].includes(o.status)));

const todayLabel = computed(() => {
  return new Date().toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
});

const lowStockCount = computed(() => D.products.filter(p => p.status === 'low' || p.status === 'out').length);
const expiringLotsCount = computed(() => D.lots.filter(l => daysUntil(l.expiry) <= 10).length);
const inTransitCount = computed(() => D.dispatchOrders.filter(d => d.status === 'in_route').length);
const pendingEvidenceCount = computed(() => D.dispatchOrders.filter(d =>
  d.requiresPOD && !D.proofOfDelivery.some(pod => pod.dispatchOrderId === d.id && pod.status === 'complete')
).length);

function handleAlert(a) {
  if (a.screen === 'inventory') router.push('/ops/operations/inventory-control');
  else if (a.screen === 'dispatch') router.push('/ops/operations/dispatch-orders');
  else if (a.screen === 'orders') router.push('/ops/commercial/purchase-orders');
  else if (a.screen === 'clients') router.push('/ops/commercial/client-accounts');
}

const filteredAlerts = computed(() => {
  if (isLogistics.value) return D.alerts;
  return D.alerts.filter(a => a.screen !== 'inventory' && a.screen !== 'dispatch');
});
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('dashboard.greeting') }}, {{ (auth.user?.name || D.user.name).split(' ')[0] }}</div>
      <div class="page-subtitle">{{ todayLabel }} · {{ auth.user?.roleName || D.user.role }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
      <i class="pi pi-plus" aria-hidden="true"></i> {{ t('nav.createOrder') }}
    </button>
  </div>

  <!-- Alerts -->
  <div class="alert-strip" v-if="filteredAlerts.length" role="alert" aria-live="polite">
    <div class="alert-strip-header" @click="alertsOpen = !alertsOpen" :aria-expanded="alertsOpen">
      <div class="alert-strip-title">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        {{ filteredAlerts.length }} {{ t('dashboard.alertsTitle').replace('{n}', '') }}
      </div>
      <i :class="alertsOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" style="color:#B91C1C;font-size:12px" aria-hidden="true"></i>
    </div>
    <div v-if="alertsOpen" class="alert-strip-items">
      <div v-for="a in filteredAlerts" :key="a.id" class="alert-item" :class="'alert-item-' + a.type">
        <div style="flex-shrink:0;margin-top:2px">
          <i :class="'pi ' + (a.type === 'danger' ? 'pi-times-circle' : a.type === 'warning' ? 'pi-exclamation-triangle' : 'pi-info-circle')"
             :style="{ color: a.type === 'danger' ? '#B91C1C' : a.type === 'warning' ? '#B45309' : '#1D4ED8' }" aria-hidden="true"></i>
        </div>
        <div class="alert-item-content">
          <div class="alert-item-title" :style="{ color: a.type === 'danger' ? '#B91C1C' : a.type === 'warning' ? '#92400E' : '#1D4ED8' }">{{ a.title }}</div>
          <div class="alert-item-desc" :style="{ color: a.type === 'danger' ? '#DC2626' : a.type === 'warning' ? '#B45309' : '#2563EB' }">{{ a.desc }}</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="handleAlert(a)">{{ a.action }}</button>
      </div>
    </div>
  </div>

  <!-- KPIs — Logistics -->
  <div v-if="isLogistics" class="grid-4" style="margin-bottom:16px" role="region" :aria-label="'KPIs'">
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-exclamation-circle" style="color:#EF4444" aria-hidden="true"></i> {{ t('dashboard.kpi.critical') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FEE2E2"><i class="pi pi-database" style="color:#B91C1C" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#EF4444">{{ lowStockCount }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.criticalSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-clock" style="color:#F97316" aria-hidden="true"></i> {{ t('dashboard.kpi.expiringLots') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FFEDD5"><i class="pi pi-clock" style="color:#C2410C" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#F97316">{{ expiringLotsCount }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.expiringLotsSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB" aria-hidden="true"></i> {{ t('dashboard.kpi.dispatch') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#DBEAFE"><i class="pi pi-send" style="color:#1D4ED8" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#2563EB">{{ inTransitCount }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.dispatchSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-camera" style="color:#F59E0B" aria-hidden="true"></i> {{ t('dashboard.kpi.evidence') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FEF3C7"><i class="pi pi-camera" style="color:#B45309" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#F59E0B">{{ pendingEvidenceCount }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.evidenceSub') }}</div>
    </div>
  </div>

  <!-- KPIs — Commercial -->
  <div v-else class="grid-4" style="margin-bottom:16px" role="region" :aria-label="'KPIs'">
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-users" style="color:#2563EB" aria-hidden="true"></i> {{ t('dashboard.kpi.activeClients') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#DBEAFE"><i class="pi pi-users" style="color:#1D4ED8" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#2563EB">{{ D.clients.filter(c => c.status === 'active').length }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.activeClientsSub', { total: D.clients.length }) }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-file-edit" style="color:#F97316" aria-hidden="true"></i> {{ t('dashboard.kpi.inValidation') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FFEDD5"><i class="pi pi-file-edit" style="color:#C2410C" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#F97316">{{ D.orders.filter(o => o.status === 'validating').length }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.inValidationSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-lock" style="color:#EF4444" aria-hidden="true"></i> {{ t('dashboard.kpi.blocked') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#FEE2E2"><i class="pi pi-ban" style="color:#B91C1C" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#EF4444">{{ D.orders.filter(o => o.status === 'blocked').length }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.blockedSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E" aria-hidden="true"></i> {{ t('dashboard.kpi.recentOrders') }}</div>
        <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#DCFCE7"><i class="pi pi-check-circle" style="color:#15803D" aria-hidden="true"></i></div>
      </div>
      <div class="kpi-value" style="color:#22C55E">{{ D.orders.length }}</div>
      <div class="kpi-sub">{{ t('dashboard.kpi.recentOrdersSub') }}</div>
    </div>
  </div>

  <!-- Two-col -->
  <div class="dash-two-col">
    <div>
      <div class="card" style="overflow:hidden;margin-bottom:12px">
        <div class="card-header">
          <span class="card-title">{{ t('dashboard.reqAction') }}</span>
          <button class="btn btn-ghost btn-sm" @click="router.push('/ops/commercial/purchase-orders')">{{ t('dashboard.viewAll') }}</button>
        </div>
        <table class="data-table" role="table" :aria-label="t('dashboard.reqAction')">
          <thead>
            <tr>
              <th scope="col">{{ t('dashboard.table.order') }}</th>
              <th scope="col">{{ t('dashboard.table.client') }}</th>
              <th scope="col">{{ t('dashboard.table.status') }}</th>
              <th scope="col">{{ t('dashboard.table.priority') }}</th>
              <th scope="col">{{ t('dashboard.table.note') }}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in pendingOrders" :key="o.id" style="cursor:pointer" @click="router.push(`/ops/commercial/purchase-orders/${o.id}`)">
              <td><span class="mono">{{ o.id }}</span></td>
              <td style="font-weight:500;font-size:13px">{{ ds.clientName(o.clientId) }}</td>
              <td><span :class="'badge ' + orderStatusBadge(o.status)">{{ orderStatusLabel(o.status) }}</span></td>
              <td><span :class="'badge-priority-' + o.priority">{{ priorityLabel(o.priority) }}</span></td>
              <td style="font-size:12px;color:#6B7280;max-width:180px">{{ o.notes || '—' }}</td>
              <td><button class="btn btn-ghost btn-sm">{{ t('common.review') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:12px">{{ t('dashboard.quickActions') }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <template v-if="isLogistics">
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/operations/inventory-control')"><i class="pi pi-database" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.inventory') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/operations/dispatch-orders')"><i class="pi pi-send" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.dispatchBoard') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/operations/operational-analytics')"><i class="pi pi-chart-bar" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.operationalAnalytics') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/commercial/manual-order-entry')"><i class="pi pi-plus-circle" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.createOrder') }}</button>
          </template>
          <template v-else>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/commercial/client-accounts')"><i class="pi pi-users" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.clients') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/commercial/manual-order-entry')"><i class="pi pi-plus-circle" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.createOrder') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/commercial/purchase-orders')"><i class="pi pi-file-edit" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.orders') }}</button>
            <button class="btn btn-ghost" style="flex-direction:column;padding:14px 8px;gap:6px;font-size:11px;height:auto" @click="router.push('/ops/product-catalog')"><i class="pi pi-box" style="font-size:20px" aria-hidden="true"></i>{{ t('nav.catalog') }}</button>
          </template>
        </div>
      </div>
      <div class="card card-pad" style="flex:1">
        <div class="card-title" style="margin-bottom:12px">{{ t('dashboard.recentActivity') }}</div>
        <div class="activity-item" v-for="a in D.activity" :key="a.time">
          <div class="activity-dot" :style="{ background: a.type === 'success' ? '#22C55E' : a.type === 'warning' ? '#F59E0B' : a.type === 'danger' ? '#EF4444' : '#60A5FA' }" aria-hidden="true"></div>
          <span class="activity-text">{{ a.text }}</span>
          <span class="activity-time">{{ a.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-two-col {
  display: grid;
  grid-template-columns: 1fr 272px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1060px) {
  .dash-two-col { grid-template-columns: 1fr; }
}
</style>
