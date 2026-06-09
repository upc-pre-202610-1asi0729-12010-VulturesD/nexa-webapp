<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { creditSummary } from '@/shared/credit';

const ds = useDataStore();
const clients = computed(() => ds.D.clients);
const activeCount = computed(() => clients.value.filter(client => client.status === 'active').length);
const creditRiskCount = computed(() => clients.value.filter(client => creditSummary(client).status !== 'ok').length);
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">B2B Clients</div>
        <div class="page-subtitle">Commercial account workspace for B2B buyers, credit attention, and validation readiness.</div>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom:18px">
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-users"></i> Accounts</div>
        <div class="kpi-value">{{ clients.length }}</div>
        <div class="kpi-sub">B2B buyers in commercial portfolio</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-check-circle" style="color:#16A34A"></i> Active</div>
        <div class="kpi-value" style="color:#16A34A">{{ activeCount }}</div>
        <div class="kpi-sub">Ready for request validation</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-exclamation-triangle" style="color:#F59E0B"></i> Credit review</div>
        <div class="kpi-value" style="color:#F59E0B">{{ creditRiskCount }}</div>
        <div class="kpi-sub">Need commercial attention</div>
      </div>
    </div>

    <div v-if="!clients.length" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-database"></i></div>
      <div class="empty-state-title">Client workspace unavailable</div>
      <div class="empty-state-desc">Start the local support service to review client account records.</div>
    </div>

    <div v-else class="grid-3">
      <article v-for="client in clients" :key="client.id" class="flow-panel flow-panel-pad">
        <div class="flow-row-between" style="align-items:flex-start">
          <div>
            <div class="meta-label">Client</div>
            <h2 style="margin:6px 0 4px">{{ client.commercialName || client.businessName }}</h2>
            <p class="muted-text">RUC {{ client.ruc }} · {{ client.segment }}</p>
          </div>
          <span :class="'badge ' + creditSummary(client).badgeClass">{{ creditSummary(client).statusLabel }}</span>
        </div>
        <div class="divider" style="margin:12px 0"></div>
        <div class="flow-stack" style="gap:8px">
          <div class="mini-row"><span>Contact</span><strong>{{ client.contact }}</strong></div>
          <div class="mini-row"><span>Condition</span><strong>{{ client.paymentCondition }}</strong></div>
          <div class="mini-row"><span>Credit available</span><strong>S/ {{ Number(client.monthlyCreditAvailable || 0).toLocaleString() }}</strong></div>
        </div>
      </article>
    </div>
  </div>
</template>
