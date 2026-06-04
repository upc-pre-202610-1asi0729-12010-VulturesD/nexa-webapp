<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { daysUntil, orderStatusLabel, orderStatusBadge } from '@/shared/status';

const { t } = useI18n();

const ds = useDataStore();
const auth = useAuthStore();
const D  = ds.D;

const roleKey = computed(() => auth.user?.roleKey || 'commercial');
const isLogistics = computed(() => roleKey.value === 'logistics');

const totalOrders   = computed(() => D.orders.length);
const deliveredOrders = computed(() => D.orders.filter(o => o.status === 'delivered').length);
const blockedOrders = computed(() => D.orders.filter(o => o.status === 'blocked').length);
const activeOrders  = computed(() => D.orders.filter(o => !['delivered','cancelled','rejected'].includes(o.status)).length);

const totalRevenue   = computed(() => D.orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0));
const pendingRevenue = computed(() => D.orders.filter(o => ['confirmed','preparing','dispatched'].includes(o.status)).reduce((s, o) => s + o.total, 0));

const activeDispatches = computed(() => D.dispatchOrders.filter(d => d.status === 'in_route').length);
const pendingEvidence  = computed(() => D.dispatchOrders.filter(d =>
  d.requiresPOD && !D.proofOfDelivery.some(pod => pod.dispatchOrderId === d.id && pod.status === 'complete')
).length);

const expiringLots = computed(() => D.lots.filter(l => daysUntil(l.expiry) <= 10));
const lowStock     = computed(() => D.products.filter(p => p.status === 'low' || p.status === 'out'));

const statusCounts = computed(() => {
  const map = {};
  D.orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

const categoryRevenue = computed(() => {
  const map = {};
  D.products.forEach(p => {
    const sales = D.orders
      .filter(o => o.status !== 'cancelled')
      .flatMap(o => o.items)
      .filter(i => i.productId === p.id)
      .reduce((s, i) => s + i.qty * i.price, 0);
    if (sales > 0) {
      map[p.category] = (map[p.category] || 0) + sales;
    }
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
});

const maxCatRevenue = computed(() => Math.max(...categoryRevenue.value.map(([, v]) => v), 1));
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ isLogistics ? t('operationalAnalytics.titleLogistics') : t('operationalAnalytics.titleCommercial') }}</div>
      <div class="page-subtitle">
        {{ D.company.name }} · {{ isLogistics ? t('operationalAnalytics.subtitleLogistics') : t('operationalAnalytics.subtitleCommercial') }}
      </div>
    </div>
  </div>

  <!-- KPI row -->
  <div class="grid-4" style="margin-bottom:20px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-file-edit" style="color:#2563EB"></i> {{ t('operationalAnalytics.activeOrders') }}</div>
      <div class="kpi-value" style="color:#2563EB">{{ activeOrders }}</div>
      <div class="kpi-sub">{{ t('operationalAnalytics.ofPeriod', { total: totalOrders }) }}</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E"></i> {{ t('operationalAnalytics.completedDeliveries') }}</div>
      <div class="kpi-value" style="color:#22C55E">{{ deliveredOrders }}</div>
      <div class="kpi-sub">{{ t('operationalAnalytics.billed', { amount: totalRevenue.toFixed(2) }) }}</div>
    </div>
    <div v-if="isLogistics" class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-send" style="color:#F59E0B"></i> {{ t('operationalAnalytics.inTransit') }}</div>
      <div class="kpi-value" style="color:#F59E0B">{{ activeDispatches }}</div>
      <div class="kpi-sub">{{ t('operationalAnalytics.withoutEvidence', { n: pendingEvidence }) }}</div>
    </div>
    <div v-else class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-wallet" style="color:#F59E0B"></i> {{ t('operationalAnalytics.pendingCollection') }}</div>
      <div class="kpi-value" style="color:#F59E0B">S/ {{ pendingRevenue.toFixed(0) }}</div>
      <div class="kpi-sub">{{ t('operationalAnalytics.inPrepDispatch') }}</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-ban" style="color:#EF4444"></i> {{ t('operationalAnalytics.blocked') }}</div>
      <div class="kpi-value" style="color:#EF4444">{{ blockedOrders }}</div>
      <div class="kpi-sub">{{ t('operationalAnalytics.requireAction') }}</div>
    </div>
  </div>

  <div class="analytics-grid-2">

    <!-- Orders by status -->
    <div class="card" style="overflow:hidden">
      <div class="card-header"><span class="card-title">{{ t('operationalAnalytics.byStatus') }}</span></div>
      <table class="data-table analytics-status-table">
        <thead><tr><th>{{ t('operationalAnalytics.table.status') }}</th><th>{{ t('operationalAnalytics.table.count') }}</th><th>{{ t('operationalAnalytics.table.pct') }}</th></tr></thead>
        <tbody>
          <tr v-for="[s, count] in statusCounts" :key="s">
            <td><span :class="'badge ' + orderStatusBadge(s)">{{ orderStatusLabel(s) }}</span></td>
            <td style="font-weight:600">{{ count }}</td>
            <td>
              <div class="analytics-percent-cell">
                <div class="analytics-percent-bar">
                  <div :style="{ width: Math.round(count / totalOrders * 100) + '%', height: '100%', background: '#2563EB', borderRadius: '9999px' }"></div>
                </div>
                <span style="font-size:11px;color:#6B7280;min-width:28px">{{ Math.round(count / totalOrders * 100) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Revenue by category -->
    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:16px">{{ t('operationalAnalytics.byCategory') }}</div>
      <div v-if="!categoryRevenue.length" style="text-align:center;color:#9CA3AF;font-size:13px;padding:20px 0">
        {{ t('operationalAnalytics.noSalesData') }}
      </div>
      <div v-for="([cat, val]) in categoryRevenue" :key="cat" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="color:#374151;font-weight:500">{{ cat }}</span>
          <span style="color:#6B7280">S/ {{ val.toFixed(2) }}</span>
        </div>
        <div style="height:6px;background:#F3F0EC;border-radius:9999px;overflow:hidden">
          <div :style="{ width: Math.round(val / maxCatRevenue * 100) + '%', height: '100%', background: '#2563EB', borderRadius: '9999px' }"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isLogistics" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

    <!-- FEFO alerts -->
    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <span class="card-title">{{ t('operationalAnalytics.expiringLots') }}</span>
        <span style="font-size:12px;color:#6B7280">{{ t('operationalAnalytics.lotsDays') }}</span>
      </div>
      <div v-if="!expiringLots.length" style="padding:24px;text-align:center;color:#9CA3AF;font-size:13px">
        {{ t('operationalAnalytics.noExpiring') }}
      </div>
      <table v-else class="data-table">
        <thead><tr><th>{{ t('operationalAnalytics.table.lot') }}</th><th>{{ t('operationalAnalytics.table.product') }}</th><th>{{ t('operationalAnalytics.table.expiry') }}</th><th>{{ t('operationalAnalytics.table.available') }}</th></tr></thead>
        <tbody>
          <tr v-for="l in expiringLots" :key="l.id">
            <td><span class="mono">{{ l.id }}</span></td>
            <td style="font-size:12px;font-weight:500">{{ ds.productName(l.productId) }}</td>
            <td>
              <span :class="daysUntil(l.expiry) <= 5 ? 'badge badge-red' : 'badge badge-amber'">
                {{ l.expiry }} ({{ daysUntil(l.expiry) }}d)
              </span>
            </td>
            <td style="font-weight:600">{{ l.qty - l.reserved }} {{ ds.productById(l.productId)?.unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Low/out stock -->
    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <span class="card-title">{{ t('operationalAnalytics.criticalStock') }}</span>
        <span style="font-size:12px;color:#6B7280">{{ t('operationalAnalytics.criticalStockSub') }}</span>
      </div>
      <div v-if="!lowStock.length" style="padding:24px;text-align:center;color:#9CA3AF;font-size:13px">
        {{ t('operationalAnalytics.allStockNormal') }}
      </div>
      <table v-else class="data-table">
        <thead><tr><th>{{ t('operationalAnalytics.table.product') }}</th><th>{{ t('operationalAnalytics.table.available') }}</th><th>{{ t('operationalAnalytics.table.minimum') }}</th><th>{{ t('operationalAnalytics.table.status') }}</th></tr></thead>
        <tbody>
          <tr v-for="p in lowStock" :key="p.id">
            <td style="font-size:12px;font-weight:500">{{ p.name }}</td>
            <td :style="{ fontWeight: '600', color: p.status === 'out' ? '#B91C1C' : '#C2410C' }">
              {{ p.stock - p.reserved }} {{ p.unit }}
            </td>
            <td style="font-size:12px;color:#6B7280">{{ p.minStock }} {{ p.unit }}</td>
            <td>
              <span :class="'badge ' + (p.status === 'out' ? 'badge-red' : 'badge-amber')">
                {{ p.status === 'out' ? t('operationalAnalytics.outOfStock') : t('operationalAnalytics.lowStock') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="banner banner-info" style="margin-top:20px">
    <i class="pi pi-info-circle"></i>
    <div>{{ t('operationalAnalytics.demoBanner') }}</div>
  </div>
</template>

<style scoped>
@media (max-width: 900px) {
  div[style*="grid-template-columns:1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
}
</style>
