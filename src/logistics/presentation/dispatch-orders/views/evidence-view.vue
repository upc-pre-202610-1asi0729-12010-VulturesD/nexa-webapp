<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, orderStatusBadge, displayCode } from '@/shared/status';

const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const rows = computed(() =>
  D.dispatchOrders.map(dispatch => ({
    dispatch,
    pod: D.proofOfDelivery.find(item => item.dispatchOrderId === dispatch.id),
    order: ds.purchaseOrderById(dispatch.orderId),
  }))
);
const pendingRows = computed(() => rows.value.filter(row => row.dispatch.requiresPOD && row.pod?.status !== 'complete'));
const completedRows = computed(() => rows.value.filter(row => row.pod?.status === 'complete'));

</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Proof of Delivery</div>
      <div class="page-subtitle">Photo and signature evidence for delivery closure and buyer tracking.</div>
    </div>
  </div>

  <div class="grid-3" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-camera" style="color:#F59E0B"></i> Pending</div>
      <div class="kpi-value" style="color:#F59E0B">{{ pendingRows.length }}</div>
      <div class="kpi-sub">Need photo/signature</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-check" style="color:#16A34A"></i> Completed</div>
      <div class="kpi-value" style="color:#16A34A">{{ completedRows.length }}</div>
      <div class="kpi-sub">Visible in S3 tracking</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-truck" style="color:#2563EB"></i> Dispatch Orders</div>
      <div class="kpi-value" style="color:#2563EB">{{ D.dispatchOrders.length }}</div>
      <div class="kpi-sub">On the operations board</div>
    </div>
  </div>

  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <div class="flow-title">Proof of Delivery by Dispatch Order</div>
        <div class="flow-subtitle">Completing POD updates dispatch order status and buyer tracking.</div>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>Dispatch Order</th><th>Client</th><th>Purchase Order</th><th>Status</th><th>POD</th><th>Action</th></tr></thead>
      <tbody>
        <tr v-for="row in rows" :key="row.dispatch.id">
          <td>
            <div class="mono">{{ displayCode(row.dispatch) }}</div>
            <div class="flow-note">{{ row.dispatch.routeName }}</div>
          </td>
          <td>{{ ds.clientName(row.dispatch.clientId) }}</td>
          <td><span class="mono">{{ displayCode(row.order) }}</span></td>
          <td><span :class="'badge ' + orderStatusBadge(row.dispatch.status)">{{ orderStatusLabel(row.dispatch.status) }}</span></td>
          <td>
            <span :class="'badge ' + (row.pod?.status === 'complete' ? 'badge-green' : 'badge-amber')">
              {{ row.pod?.status === 'complete' ? 'Complete' : 'Pending' }}
            </span>
          </td>
          <td>
            <div class="flow-row">
              <button class="btn btn-ghost btn-sm" @click="router.push('/ops/operations/dispatch-orders/' + row.dispatch.id)">Details</button>
              <button class="btn btn-secondary btn-sm" disabled>POD upload read-only</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
