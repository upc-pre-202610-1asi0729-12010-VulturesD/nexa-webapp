<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { coldTypeLabel, coldTypeBadge, orderStatusLabel, orderStatusBadge, daysUntil } from '@/shared/status';
import { creditSummary } from '@/shared/credit';

const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const lowStock = computed(() => D.products.filter(product => ['low', 'out'].includes(product.status)));
const expiringLots = computed(() => D.inventoryLots.filter(lot => daysUntil(lot.expiry || lot.expirationDate) <= 30));
const dispatchOrdersToday = computed(() => D.dispatchOrders.filter(dispatchOrder => !['delivered'].includes(dispatchOrder.status)));
const pendingPod = computed(() => D.dispatchOrders.filter(dispatch => dispatch.requiresPOD && !D.proofOfDelivery.some(pod => pod.dispatchOrderId === dispatch.id && pod.status === 'complete')));
const incidents = computed(() => D.dispatchOrders.filter(dispatch => dispatch.status === 'incident'));
const creditFor = (dispatch) => creditSummary(ds.clientById(dispatch.clientId) || {});
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Operations Dashboard</div>
      <div class="page-subtitle">Monitor inventory, dispatch orders, delivery status and critical alerts.</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/operations/dispatch-orders')">
      <i class="pi pi-send"></i> Dispatch Orders
    </button>
  </div>

  <div class="flow-action-banner">
    <div>
      <div class="flow-eyebrow">S1 validates -> S2 executes</div>
      <div class="flow-title">{{ dispatchOrdersToday.length }} active dispatch orders, {{ pendingPod.length }} pending proof-of-delivery records and {{ expiringLots.length }} FEFO-priority lots.</div>
      <div class="flow-note">Use the board to move from document readiness to preparation, route and POD.</div>
    </div>
    <button class="btn btn-secondary" @click="router.push('/ops/operations/proof-of-delivery')"><i class="pi pi-camera"></i> Proof of Delivery</button>
  </div>

  <div class="grid-4" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-database" style="color:#EF4444"></i> Critical Stock</div>
      <div class="kpi-value" style="color:#EF4444">{{ lowStock.length }}</div>
      <div class="kpi-sub">Below minimum or out of stock</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B"></i> FEFO Lots</div>
      <div class="kpi-value" style="color:#F59E0B">{{ expiringLots.length }}</div>
      <div class="kpi-sub">Expire in 30 days or less</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB"></i> Active Dispatch Orders</div>
      <div class="kpi-value" style="color:#2563EB">{{ dispatchOrdersToday.length }}</div>
      <div class="kpi-sub">Validating, preparing or on route</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-camera" style="color:#4F46E5"></i> Pending POD</div>
      <div class="kpi-value" style="color:#4F46E5">{{ pendingPod.length }}</div>
      <div class="kpi-sub">{{ incidents.length }} open incidents</div>
    </div>
  </div>

  <div class="flow-grid-12">
    <section class="flow-panel span-7">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Dispatch Board preview</div>
          <div class="flow-subtitle">Cards ready to move through operations.</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="router.push('/ops/operations/dispatch-orders')">Dispatch Orders</button>
      </div>
      <div class="flow-panel-pad flow-stack">
        <div v-for="dispatch in D.dispatchOrders.slice(0, 5)" :key="dispatch.id" class="flow-list-item">
          <div>
            <div class="flow-row" style="margin-bottom:5px">
              <span class="mono">{{ dispatch.id }}</span>
              <span :class="'badge ' + orderStatusBadge(dispatch.status)">{{ orderStatusLabel(dispatch.status) }}</span>
              <span :class="coldTypeBadge(dispatch.coldType)">{{ coldTypeLabel(dispatch.coldType) }}</span>
              <span :class="'badge ' + creditFor(dispatch).badgeClass">{{ creditFor(dispatch).statusLabel }}</span>
            </div>
            <div style="font-size:13px;font-weight:800">{{ ds.clientName(dispatch.clientId) }}</div>
            <div class="flow-note">{{ dispatch.routeName }} - ETA {{ new Date(dispatch.eta).toLocaleString('en-US') }} - Credit available S/ {{ creditFor(dispatch).available.toLocaleString() }}</div>
          </div>
          <button class="btn btn-primary btn-sm" @click="router.push('/ops/operations/dispatch-orders/' + dispatch.id)">Open</button>
        </div>
      </div>
    </section>

    <section class="flow-panel span-5">
      <div class="flow-panel-head"><div class="flow-title">Operational Alerts</div></div>
      <div class="flow-panel-pad flow-stack">
        <div v-for="product in lowStock" :key="product.id" class="flow-list-item">
          <div>
            <div style="font-weight:800">{{ product.name }}</div>
            <div class="flow-note">Available {{ product.stock - product.reserved }} {{ product.unit }} / minimum {{ product.minStock }}</div>
          </div>
          <span :class="'badge ' + (product.status === 'out' ? 'badge-red' : 'badge-amber')">{{ product.status }}</span>
        </div>
        <div v-for="lot in expiringLots.slice(0, 3)" :key="lot.id" class="flow-list-item">
          <div>
            <div style="font-weight:800">{{ ds.productName(lot.productId) }}</div>
            <div class="flow-note">{{ lot.id }} due {{ lot.expiry }} - FEFO {{ lot.fefoPriority }}</div>
          </div>
          <span class="badge badge-amber">{{ daysUntil(lot.expiry) }} days</span>
        </div>
      </div>
    </section>

    <section class="flow-panel span-5">
      <div class="flow-panel-head"><div class="flow-title">Quick Actions</div></div>
      <div class="flow-panel-pad flow-stack">
        <button class="btn btn-secondary" @click="router.push('/ops/operations/inventory-control')"><i class="pi pi-database"></i> Inventory Control</button>
        <button class="btn btn-primary" @click="router.push('/ops/operations/dispatch-orders')"><i class="pi pi-send"></i> Dispatch Orders</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/proof-of-delivery')"><i class="pi pi-camera"></i> Proof of Delivery</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/operational-analytics')"><i class="pi pi-chart-bar"></i> Operational Analytics</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/business-documents')"><i class="pi pi-file-check"></i> Business Documents</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/promotions')"><i class="pi pi-megaphone"></i> Promotions</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/customer-portals')"><i class="pi pi-upload"></i> Customer Portals</button>
        <button class="btn btn-secondary" @click="router.push('/ops/operations/company-administration')"><i class="pi pi-building"></i> Company Administration</button>
      </div>
    </section>
  </div>
</template>
