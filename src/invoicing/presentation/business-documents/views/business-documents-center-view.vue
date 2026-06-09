<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { documentStatusLabel, documentStatusBadge, orderStatusLabel, orderStatusBadge } from '@/shared/status';

const ds = useDataStore();
const D = ds.D;
const statusFilter = ref('all');

const documents = computed(() => {
  const rows = D.businessDocuments || [];
  if (statusFilter.value === 'all') return rows;
  return rows.filter(document => document.status === statusFilter.value);
});
const pendingCount = computed(() => D.businessDocuments.filter(document => document.status === 'pending').length);
const acceptedCount = computed(() => D.businessDocuments.filter(document => document.status === 'accepted').length);
const totalAmount = computed(() => D.businessDocuments.reduce((sum, document) => sum + Number(document.amount || 0), 0));
const formatMoney = (value, currency = 'PEN') => `${currency} ${Number(value || 0).toFixed(2)}`;
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Business Documents</div>
      <div class="page-subtitle">Invoice records loaded from the Nexa backend invoicing endpoints.</div>
    </div>
  </div>

  <div class="grid-3" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B"></i> Pending</div>
      <div class="kpi-value" style="color:#F59E0B">{{ pendingCount }}</div>
      <div class="kpi-sub">Invoices awaiting payment confirmation</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-check" style="color:#16A34A"></i> Accepted</div>
      <div class="kpi-value" style="color:#16A34A">{{ acceptedCount }}</div>
      <div class="kpi-sub">Invoices marked as paid</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-wallet" style="color:#2563EB"></i> Total billed</div>
      <div class="kpi-value" style="color:#2563EB">S/ {{ totalAmount.toFixed(2) }}</div>
      <div class="kpi-sub">Current backend invoice amount</div>
    </div>
  </div>

  <div class="filter-bar">
    <button v-for="status in ['all', 'pending', 'accepted']" :key="status" class="filter-chip" :class="{ active: statusFilter === status }" @click="statusFilter = status">
      {{ status === 'all' ? 'All invoices' : documentStatusLabel(status) }}
    </button>
  </div>

  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <div class="flow-title">Invoices</div>
        <div class="flow-subtitle">Mapped from `/api/v1/invoices`; payment references are available in the Payments page.</div>
      </div>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Invoice</th>
          <th>Purchase Order</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Payment Status</th>
          <th>Order Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="document in documents" :key="document.id">
          <td>
            <div style="font-weight:800">{{ document.label }}</div>
            <div class="flow-note">{{ document.fileName }}</div>
          </td>
          <td><span class="mono">{{ document.orderId }}</span></td>
          <td>{{ ds.clientName(document.clientId) }}</td>
          <td style="font-weight:700">{{ formatMoney(document.amount, document.currency) }}</td>
          <td><span :class="'badge ' + documentStatusBadge(document.status)">{{ documentStatusLabel(document.status) }}</span></td>
          <td>
            <span v-if="ds.purchaseOrderById(document.orderId)" :class="'badge ' + orderStatusBadge(ds.purchaseOrderById(document.orderId).status)">
              {{ orderStatusLabel(ds.purchaseOrderById(document.orderId).status) }}
            </span>
            <span v-else class="badge badge-gray">Order pending</span>
          </td>
        </tr>
        <tr v-if="!documents.length">
          <td colspan="6">
            <div class="empty-state compact">
              <div class="empty-state-icon"><i class="pi pi-file"></i></div>
              <div class="empty-state-title">No invoices found</div>
              <div class="empty-state-desc">No backend invoice records match this filter.</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
