<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, displayCode, recordTimestamp } from '@/shared/status';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const requests = computed(() => ds.D.purchaseRequests
  .filter(request => request.clientId === auth.user?.clientId)
  .sort((a, b) => recordTimestamp(b) - recordTimestamp(a)));
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">My Requests</div>
      <div class="page-subtitle">{{ requests.length }} requests submitted for commercial validation.</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/portal/product-catalog')"><i class="pi pi-plus"></i> New Request</button>
  </div>

  <div v-if="!requests.length" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-inbox"></i></div>
    <div class="empty-state-title">No purchase requests yet</div>
    <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">Product Catalog</button>
  </div>

  <div v-else class="flow-stack">
    <article v-for="request in requests" :key="request.id" class="buyer-card flow-panel-pad">
      <div class="flow-row-between" style="align-items:flex-start">
        <div>
          <div class="flow-row" style="margin-bottom:5px">
            <span class="mono" style="font-weight:800;color:#1D4ED8">{{ displayCode(request) }}</span>
            <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
          </div>
          <div class="flow-note">{{ request.createdAt?.slice(0, 10) }} - requested delivery {{ request.requestedDeliveryDate }}</div>
          <div style="font-size:13px;margin-top:8px">{{ request.comments }}</div>
        </div>
        <div class="flow-row">
          <span class="flow-pill">{{ ds.requestItemsFor(request.id).length }} item(s)</span>
          <button class="btn btn-primary btn-sm" @click="router.push('/portal/purchase-requests/' + request.id)">View</button>
        </div>
      </div>
    </article>
  </div>
</template>
