<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, orderStatusBadge, buildOrderTrackingSteps, displayCode, recordTimestamp } from '@/shared/status';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const orders = computed(() =>
  ds.D.purchaseOrders
    .filter(order => order.clientId === auth.user?.clientId)
    .sort((a, b) => recordTimestamp(b, ds.timelineForOrder(b.id)) - recordTimestamp(a, ds.timelineForOrder(a.id)))
);
const stepsFor = (order) => buildOrderTrackingSteps(order, ds.timelineForOrder(order.id));
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">My Orders</div>
      <div class="page-subtitle">{{ orders.length }} confirmed or historical purchase orders.</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/portal/product-catalog')"><i class="pi pi-plus"></i> New Request</button>
  </div>

  <div v-if="!orders.length" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-clipboard"></i></div>
    <div class="empty-state-title">No confirmed purchase orders yet</div>
    <div class="empty-state-desc">When S1 converts a request, it will appear here.</div>
  </div>

  <div v-else class="flow-stack">
    <article v-for="order in orders" :key="order.id" class="buyer-card flow-panel-pad">
      <div class="flow-row-between" style="align-items:flex-start;margin-bottom:14px">
        <div>
          <div class="flow-row" style="margin-bottom:5px">
            <span class="mono" style="font-weight:800;color:#1D4ED8">{{ displayCode(order) }}</span>
            <span :class="'badge ' + orderStatusBadge(order.status)">{{ orderStatusLabel(order.status) }}</span>
          </div>
          <div class="flow-note">{{ order.createdAt?.slice(0, 10) }} - {{ ds.orderItemsFor(order.id).length }} item(s) - {{ order.totalEstimatedWeightKg }} kg</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800">S/ {{ Number(order.total || 0).toFixed(2) }}</div>
          <button class="btn btn-primary btn-sm" style="margin-top:8px" @click="router.push('/portal/purchase-orders/' + order.id)">Tracking</button>
        </div>
      </div>

      <div class="flow-timeline-horizontal">
        <div
          v-for="step in stepsFor(order)"
          :key="step.key"
          class="flow-track-step"
          :class="step.state"
        >
          <div class="flow-track-index">{{ step.index }}</div>
          <div class="flow-track-label">{{ step.label }}</div>
          <div class="flow-track-date">{{ step.dateLabel }}</div>
        </div>
      </div>
    </article>
  </div>
</template>
