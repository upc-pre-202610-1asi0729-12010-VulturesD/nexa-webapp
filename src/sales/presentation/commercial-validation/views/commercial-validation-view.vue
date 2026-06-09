<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, displayCode } from '@/shared/status';
import { creditSummary } from '@/shared/credit';

const route = useRoute();
const router = useRouter();
const ds = useDataStore();
const request = computed(() => ds.purchaseRequestById(route.params.id));
const client = computed(() => request.value ? ds.clientById(request.value.clientId) : null);
const items = computed(() => request.value ? ds.requestItemsFor(request.value.id) : []);
const credit = computed(() => creditSummary(client.value || {}));
</script>

<template>
  <div v-if="!request" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-check-square"></i></div>
    <div class="empty-state-title">Request not found</div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/purchase-requests')">Back to inbox</button>
  </div>

  <div v-else>
    <div class="page-header">
      <div>
        <div class="page-title">Commercial Validation</div>
        <div class="page-subtitle">{{ displayCode(request) }} · {{ ds.clientName(request.clientId) }}</div>
      </div>
      <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Request checklist</div>
            <div class="flow-subtitle">Local validation workflow for unsupported purchase request endpoint.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="mini-row"><span>Credit status</span><span :class="'badge ' + credit.badgeClass">{{ credit.statusLabel }}</span></div>
          <div class="mini-row"><span>Delivery date</span><strong>{{ request.requestedDeliveryDate }}</strong></div>
          <div class="mini-row"><span>Document profile</span><strong>{{ request.documentProfile }}</strong></div>
          <div class="mini-row"><span>Commercial owner</span><strong>{{ request.commercialOwnerId }}</strong></div>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Client account</div>
            <div class="flow-subtitle">{{ client?.businessName || request.clientId }}</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="mini-row"><span>Credit available</span><strong>S/ {{ credit.available.toLocaleString() }}</strong></div>
          <div class="mini-row"><span>Payment condition</span><strong>{{ client?.paymentCondition || 'N/A' }}</strong></div>
          <div class="mini-row"><span>Contact</span><strong>{{ client?.contact || 'N/A' }}</strong></div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Requested items</div>
            <div class="flow-subtitle">{{ request.comments }}</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="item in items" :key="item.id" class="mini-row">
            <span>{{ ds.productName(item.productId) }}</span>
            <strong>{{ item.quantity }} {{ item.unit }}</strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
