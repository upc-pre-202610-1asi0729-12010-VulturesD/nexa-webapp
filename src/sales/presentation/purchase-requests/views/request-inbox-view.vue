<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, displayCode, recordTimestamp } from '@/shared/status';

const router = useRouter();
const ds = useDataStore();
const requests = computed(() => [...ds.D.purchaseRequests].sort((a, b) => recordTimestamp(b) - recordTimestamp(a)));
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Purchase Requests</div>
        <div class="page-subtitle">Buyer request inbox for commercial review before confirmed purchase orders.</div>
      </div>
      <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
        <i class="pi pi-plus"></i> Manual Order Entry
      </button>
    </div>

    <div v-if="!requests.length" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-inbox"></i></div>
      <div class="empty-state-title">No request records loaded</div>
      <div class="empty-state-desc">Start the local support service to review buyer request records.</div>
    </div>

    <div v-else class="flow-stack">
      <article v-for="request in requests" :key="request.id" class="flow-panel flow-panel-pad">
        <div class="flow-row-between" style="align-items:flex-start">
          <div>
            <div class="flow-row" style="margin-bottom:6px">
              <span class="mono" style="font-weight:800;color:#1D4ED8">{{ displayCode(request) }}</span>
              <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
            </div>
            <h2 style="margin:0">{{ ds.clientName(request.clientId) }}</h2>
            <p class="muted-text">{{ request.comments }}</p>
          </div>
          <span class="badge badge-blue">{{ request.priority || 'normal' }}</span>
        </div>
        <div class="divider" style="margin:12px 0"></div>
        <div class="flow-row" style="justify-content:space-between;gap:12px;flex-wrap:wrap">
          <span>Delivery: <strong>{{ request.requestedDeliveryDate }}</strong></span>
          <span>Items: <strong>{{ ds.requestItemsFor(request.id).length }}</strong></span>
          <span>Documents: <strong>{{ request.documentProfile }}</strong></span>
        </div>
      </article>
    </div>
  </div>
</template>
