<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, orderStatusBadge, coldTypeLabel, coldTypeBadge, displayCode } from '@/shared/status';
import { creditSummary } from '@/shared/credit';

const router = useRouter();
const ds = useDataStore();
const D = ds.D;
const search = ref('');
const routeFilter = ref('all');

const columns = [
  { key: 'validating', label: 'In validation' },
  { key: 'document_pending', label: 'Pending Business Documents' },
  { key: 'ready_for_operations', label: 'Ready for operations' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_route', label: 'Ready for route' },
  { key: 'in_route', label: 'On route' },
  { key: 'delayed', label: 'Delayed' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'incident', label: 'Incident' },
];

const routes = computed(() => ['all', ...new Set(D.dispatchOrders.map(dispatch => dispatch.routeName).filter(Boolean))]);

const filtered = computed(() => {
  let rows = D.dispatchOrders;
  if (routeFilter.value !== 'all') rows = rows.filter(dispatch => dispatch.routeName === routeFilter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    rows = rows.filter(dispatch =>
      displayCode(dispatch).toLowerCase().includes(q) ||
      String(dispatch.orderId).toLowerCase().includes(q) ||
      ds.clientName(dispatch.clientId).toLowerCase().includes(q)
    );
  }
  return rows;
});

function byColumn(column) {
  return filtered.value.filter(dispatch => (dispatch.column || dispatch.status) === column.key);
}

function isDelayed(dispatch) {
  return dispatch.status === 'delayed' || (dispatch.eta && new Date(dispatch.eta) < new Date() && !['delivered', 'incident'].includes(dispatch.status));
}

function creditFor(dispatch) {
  return creditSummary(ds.clientById(dispatch.clientId) || {});
}

</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Dispatch Board</div>
      <div class="page-subtitle">{{ D.dispatchOrders.length }} dispatch orders - S2 operational board for route execution.</div>
    </div>
    <button class="btn btn-secondary" @click="router.push('/ops/operations/proof-of-delivery')">
      <i class="pi pi-camera"></i> Proof of Delivery
    </button>
  </div>

  <div class="filter-bar">
    <div class="search-input">
      <i class="pi pi-search"></i>
      <input v-model="search" placeholder="Search dispatch order, purchase order or client..." />
    </div>
    <button
      v-for="routeName in routes"
      :key="routeName"
      class="filter-chip"
      :class="{ active: routeFilter === routeName }"
      @click="routeFilter = routeName"
    >
      {{ routeName === 'all' ? 'All routes' : routeName }}
    </button>
  </div>

  <div class="kanban-board">
    <section v-for="column in columns" :key="column.key" class="kanban-column">
      <div class="kanban-column-head">
        <div class="kanban-column-title">{{ column.label }}</div>
        <span class="flow-pill">{{ byColumn(column).length }}</span>
      </div>

      <article
        v-for="dispatch in byColumn(column)"
        :key="dispatch.id"
        class="dispatch-card"
        @click="router.push('/ops/operations/dispatch-orders/' + dispatch.id)"
      >
        <div class="flow-row-between" style="margin-bottom:8px">
          <span class="mono">{{ displayCode(dispatch) }}</span>
          <span :class="'badge-priority-' + (dispatch.priority === 'normal' ? 'medium' : dispatch.priority)">{{ dispatch.priority }}</span>
        </div>
        <div style="font-size:13px;font-weight:800;margin-bottom:3px">{{ ds.clientName(dispatch.clientId) }}</div>
        <div class="flow-note">Purchase Order <span class="mono">{{ dispatch.orderId }}</span></div>
        <div class="flow-row" style="margin-top:10px;flex-wrap:wrap">
          <span :class="coldTypeBadge(dispatch.coldType)">{{ coldTypeLabel(dispatch.coldType) }}</span>
          <span :class="'badge ' + orderStatusBadge(dispatch.status)">{{ orderStatusLabel(dispatch.status) }}</span>
          <span :class="'badge ' + creditFor(dispatch).badgeClass">{{ creditFor(dispatch).statusLabel }}</span>
        </div>
        <div class="divider" style="margin:10px 0"></div>
        <div class="flow-stack" style="gap:6px">
          <div class="flow-row-between">
            <span class="flow-note">Business Documents</span>
            <strong>{{ dispatch.documentProgress || '0/0' }}</strong>
          </div>
          <div class="flow-row-between">
            <span class="flow-note">Route</span>
            <strong>{{ dispatch.routeName }}</strong>
          </div>
          <div class="flow-row-between">
            <span class="flow-note">ETA</span>
            <strong>{{ new Date(dispatch.eta).toLocaleDateString('en-US') }}</strong>
          </div>
          <div class="flow-row-between">
            <span class="flow-note">Responsible</span>
            <strong>{{ dispatch.responsible }}</strong>
          </div>
          <div v-if="creditFor(dispatch).limit" class="flow-row-between">
            <span class="flow-note">Client credit</span>
            <strong>S/ {{ creditFor(dispatch).available.toLocaleString() }} available</strong>
          </div>
        </div>
        <div v-if="isDelayed(dispatch)" class="banner banner-warning" style="margin:10px 0 0;padding:9px">
          <i class="pi pi-clock"></i>
          <div>{{ dispatch.delayReason || 'ETA requires review before buyer update.' }}</div>
        </div>
        <div v-if="dispatch.incidentNote" class="banner banner-danger" style="margin:10px 0 0;padding:9px">
          <i class="pi pi-exclamation-triangle"></i>
          <div>{{ dispatch.incidentNote }}</div>
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:12px;width:100%;justify-content:center" disabled>
          <i class="pi pi-lock"></i> Backend workflow action pending
        </button>
      </article>
    </section>
  </div>
</template>
