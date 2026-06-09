<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, displayCode, recordTimestamp } from '@/shared/status';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();
const requests = computed(() =>
  ds.D.purchaseRequests
    .filter(request => request.clientId === auth.user?.clientId)
    .sort((a, b) => recordTimestamp(b) - recordTimestamp(a))
);
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">My Requests</div>
        <div class="page-subtitle">{{ requests.length }} buyer request(s) using optional local request workflow.</div>
      </div>
      <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">
        <i class="pi pi-plus"></i> New request
      </button>
    </div>

    <div v-if="!requests.length" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-inbox"></i></div>
      <div class="empty-state-title">No requests yet</div>
      <div class="empty-state-desc">Create a request from the product catalog or run npm run server to load local request records.</div>
    </div>

    <div v-else class="flow-stack">
      <article v-for="request in requests" :key="request.id" class="buyer-card flow-panel-pad">
        <div class="flow-row-between" style="align-items:flex-start">
          <div>
            <div class="flow-row" style="margin-bottom:6px">
              <span class="mono" style="font-weight:800;color:#1D4ED8">{{ displayCode(request) }}</span>
              <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
            </div>
            <div class="flow-note">{{ request.comments }}</div>
          </div>
          <button class="btn btn-primary btn-sm" @click="router.push('/portal/purchase-requests/' + request.id)">Details</button>
        </div>
        <div class="divider" style="margin:12px 0"></div>
        <div class="flow-row" style="justify-content:space-between;gap:12px;flex-wrap:wrap">
          <span>Delivery: <strong>{{ request.requestedDeliveryDate }}</strong></span>
          <span>Items: <strong>{{ ds.requestItemsFor(request.id).length }}</strong></span>
          <span>Priority: <strong>{{ request.priority }}</strong></span>
        </div>
      </article>
    </div>
  </div>
</template>
