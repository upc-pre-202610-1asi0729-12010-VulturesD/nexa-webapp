<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

const ds = useDataStore();
const portals = computed(() => ds.D.customerPortals);
const pendingTasks = computed(() => ds.D.portalUploadTasks.filter(task => task.status !== 'completed'));
const requirementsFor = (clientId) => ds.portalRequirementsForClient(clientId);
const tasksFor = (clientId) => ds.D.portalUploadTasks.filter(task => task.clientId === clientId);
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Customer Portals</div>
        <div class="page-subtitle">External upload requirements, customer portal tasks, and shipment-document follow-up.</div>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom:18px">
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-upload"></i> Portals</div>
        <div class="kpi-value">{{ portals.length }}</div>
        <div class="kpi-sub">Customer upload channels</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B"></i> Pending tasks</div>
        <div class="kpi-value" style="color:#F59E0B">{{ pendingTasks.length }}</div>
        <div class="kpi-sub">Need manual document follow-up</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-truck" style="color:#2563EB"></i> Backend shipments</div>
        <div class="kpi-value" style="color:#2563EB">{{ ds.D.dispatchOrders.length }}</div>
        <div class="kpi-sub">Real shipment records remain protected</div>
      </div>
    </div>

    <div v-if="!portals.length" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-database"></i></div>
      <div class="empty-state-title">Portal workspace unavailable</div>
      <div class="empty-state-desc">Start the local support service to review customer portal requirements.</div>
    </div>

    <div v-else class="grid-3">
      <article v-for="portal in portals" :key="portal.id" class="flow-panel flow-panel-pad">
        <div class="flow-row-between" style="align-items:flex-start">
          <div>
            <div class="meta-label">{{ ds.clientName(portal.clientId) }}</div>
            <h2 style="margin:6px 0">{{ portal.name }}</h2>
            <p class="muted-text">{{ portal.owner }} · {{ portal.uploadMode }}</p>
          </div>
          <span :class="'badge ' + (portal.status === 'active' ? 'badge-green' : 'badge-amber')">{{ portal.status }}</span>
        </div>
        <div class="divider" style="margin:12px 0"></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span v-for="type in requirementsFor(portal.clientId)?.requiredDocumentTypes || []" :key="type" class="badge badge-blue">
            {{ type }}
          </span>
        </div>
        <div class="flow-stack" style="margin-top:12px;gap:8px">
          <div v-for="task in tasksFor(portal.clientId)" :key="task.id" class="mini-row">
            <span class="mono">{{ task.orderId }}</span>
            <span :class="'badge ' + (task.status === 'completed' ? 'badge-green' : 'badge-amber')">{{ task.status }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
