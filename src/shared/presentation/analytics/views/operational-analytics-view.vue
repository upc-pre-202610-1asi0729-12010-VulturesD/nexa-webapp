<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

const ds = useDataStore();
const ordersByStatus = computed(() => ds.D.purchaseOrders.reduce((acc, order) => {
  acc[order.status] = (acc[order.status] || 0) + 1;
  return acc;
}, {}));
const tempAttention = computed(() => ds.D.temperatureLogs.filter(log => log.status !== 'ok'));
const movementCount = computed(() => ds.D.stockMovements.length);
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Operational Analytics</div>
        <div class="page-subtitle">Current KPI view combines real backend records with optional local operational supplements.</div>
      </div>
    </div>

    <div class="grid-4" style="margin-bottom:18px">
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-box"></i> Catalog items</div>
        <div class="kpi-value">{{ ds.D.products.length }}</div>
        <div class="kpi-sub">Real backend catalog</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-shopping-cart"></i> Orders</div>
        <div class="kpi-value">{{ ds.D.purchaseOrders.length }}</div>
        <div class="kpi-sub">Real backend purchase orders</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-truck"></i> Shipments</div>
        <div class="kpi-value">{{ ds.D.dispatchOrders.length }}</div>
        <div class="kpi-sub">Real backend shipment mapping</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-thermometer" style="color:#F59E0B"></i> Temperature alerts</div>
        <div class="kpi-value" style="color:#F59E0B">{{ tempAttention.length }}</div>
        <div class="kpi-sub">Local operational supplement</div>
      </div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Orders by status</div>
            <div class="flow-subtitle">Real order data grouped for current period.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="(count, status) in ordersByStatus" :key="status" class="mini-row">
            <span>{{ status }}</span>
            <strong>{{ count }}</strong>
          </div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Stock movements</div>
            <div class="flow-subtitle">{{ movementCount }} local movement notes for unsupported stock-movement workflow.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="movement in ds.D.stockMovements" :key="movement.id" class="mini-row">
            <span><span class="mono">{{ movement.reference }}</span> · {{ ds.productName(movement.productId) }}</span>
            <strong>{{ movement.qty }}</strong>
          </div>
          <div v-if="!ds.D.stockMovements.length" class="empty-state compact">
            <div class="empty-state-title">No local stock movement records</div>
            <div class="empty-state-desc">Run npm run server for optional analytics supplements.</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
