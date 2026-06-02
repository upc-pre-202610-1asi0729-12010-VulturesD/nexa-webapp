<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { ORDER_STATUS_FILTERS, orderStatusLabel, orderStatusBadge, priorityLabel, displayCode } from '@/shared/status';

const { t } = useI18n();
const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const search = ref('');
const filter = ref('all');
const statusKeys = ORDER_STATUS_FILTERS;

const sourceOrders = computed(() => D.purchaseOrders.length ? D.purchaseOrders : D.orders);

const filtered = computed(() => {
  let arr = sourceOrders.value;
  if (filter.value !== 'all') arr = arr.filter(o => o.status === filter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    arr = arr.filter(o => displayCode(o).toLowerCase().includes(q) || ds.clientName(o.clientId).toLowerCase().includes(q));
  }
  return arr;
});
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.orders') }}</div>
      <div class="page-subtitle">{{ sourceOrders.length }} {{ t('orders.subtitle') }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
      <i class="pi pi-plus" aria-hidden="true"></i> {{ t('nav.createOrder') }}
    </button>
  </div>

  <div class="filter-bar" role="toolbar" :aria-label="'Purchase order filters'">
    <div class="search-input">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input v-model="search" :placeholder="t('orders.searchPlaceholder')" :aria-label="t('orders.searchPlaceholder')" />
    </div>
    <button class="filter-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'" :aria-pressed="filter === 'all'">{{ t('common.all') }}</button>
    <button
      v-for="s in statusKeys"
      :key="s"
      class="filter-chip"
      :class="{ active: filter === s }"
      @click="filter = s"
      :aria-pressed="filter === s"
    >{{ orderStatusLabel(s) }}</button>
  </div>

  <div class="card" style="overflow:hidden">
    <table class="data-table" role="table" :aria-label="t('nav.orders')">
      <thead>
        <tr>
          <th scope="col">{{ t('orders.table.order') }}</th>
          <th scope="col">{{ t('orders.table.client') }}</th>
          <th scope="col">{{ t('orders.table.date') }}</th>
          <th scope="col">{{ t('orders.table.total') }}</th>
          <th scope="col">{{ t('orders.table.status') }}</th>
          <th scope="col">{{ t('orders.table.priority') }}</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in filtered" :key="o.id" style="cursor:pointer" @click="router.push(`/ops/commercial/purchase-orders/${o.id}`)">
          <td><span class="mono">{{ displayCode(o) }}</span></td>
          <td>
            <div style="font-weight:500;font-size:13px">{{ ds.clientName(o.clientId) }}</div>
            <div style="font-size:11px;color:#9CA3AF">{{ ds.clientById(o.clientId)?.type || ds.clientById(o.clientId)?.segment }}</div>
          </td>
          <td style="font-size:12px;color:#6B7280">{{ o.date }}</td>
          <td style="font-weight:600;font-size:13px">S/ {{ o.total.toFixed(2) }}</td>
          <td><span :class="'badge ' + orderStatusBadge(o.status)">{{ orderStatusLabel(o.status) }}</span></td>
          <td><span :class="'badge-priority-' + o.priority">{{ priorityLabel(o.priority) }}</span></td>
          <td><button class="btn btn-ghost btn-sm">{{ t('common.view') }}</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
