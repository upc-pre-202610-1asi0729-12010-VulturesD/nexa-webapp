<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge } from '@/shared/status';

const router = useRouter();
const ds = useDataStore();
const D = ds.D;
const search = ref('');
const status = ref('all');
const statuses = ['submitted', 'in_review', 'needs_adjustment', 'approved', 'rejected', 'converted_to_order'];

const filtered = computed(() => {
  let rows = D.purchaseRequests;
  if (status.value !== 'all') rows = rows.filter(item => item.status === status.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    rows = rows.filter(item =>
      item.id.toLowerCase().includes(q) ||
      ds.clientName(item.clientId).toLowerCase().includes(q) ||
      String(item.comments || '').toLowerCase().includes(q)
    );
  }
  return rows;
});

function requestWeight(request) {
  return ds.requestItemsFor(request.id).reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0);
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Request Inbox</div>
      <div class="page-subtitle">{{ filtered.length }} filtered requests - S1 commercial validation</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
      <i class="pi pi-plus"></i> Manual Order Entry
    </button>
  </div>

  <div class="filter-bar">
    <div class="search-input">
      <i class="pi pi-search"></i>
      <input v-model="search" placeholder="Search by request, client or comment..." />
    </div>
    <button class="filter-chip" :class="{ active: status === 'all' }" @click="status = 'all'">{{ $t('common.all') }}</button>
    <button
      v-for="item in statuses"
      :key="item"
      class="filter-chip"
      :class="{ active: status === item }"
      @click="status = item"
    >
      {{ requestStatusLabel(item) }}
    </button>
  </div>

  <section class="flow-panel">
    <table class="data-table">
      <thead>
        <tr>
          <th>Purchase Request</th>
          <th>Client</th>
          <th>Requested Date</th>
          <th>Items / Weight</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Business Documents</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in filtered" :key="request.id" @click="router.push('/ops/commercial/purchase-requests/' + request.id)" style="cursor:pointer">
          <td>
            <div class="mono">{{ request.id }}</div>
            <div class="flow-note">{{ request.createdByRole === 'buyer' ? 'Buyer Portal' : 'Purchase Order manual' }}</div>
          </td>
          <td>
            <div style="font-size:13px;font-weight:700">{{ ds.clientName(request.clientId) }}</div>
            <div class="flow-note">{{ ds.clientById(request.clientId)?.ruc }}</div>
          </td>
          <td>{{ request.requestedDeliveryDate || '-' }}</td>
          <td>
            <div style="font-weight:700">{{ ds.requestItemsFor(request.id).length }} item(s)</div>
            <div class="flow-note">{{ requestWeight(request) }} estimated kg</div>
          </td>
          <td><span :class="'badge-priority-' + (request.priority === 'normal' ? 'medium' : request.priority)">{{ request.priority }}</span></td>
          <td><span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span></td>
          <td>
            <span class="flow-pill flow-pill-blue">{{ request.documentProfile || 'standard_docs' }}</span>
          </td>
          <td><button class="btn btn-primary btn-sm">Review</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
