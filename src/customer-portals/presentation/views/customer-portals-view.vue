<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { documentStatusBadge } from '@/shared/status';

const ds = useDataStore();
const D = ds.D;

const portalRows = computed(() => D.customerPortals.map(portal => ({
  portal,
  client: ds.clientById(portal.clientId),
  requirements: D.portalRequirements.find(item => item.portalId === portal.id),
  tasks: D.portalUploadTasks.filter(task => task.portalId === portal.id),
})));

function statusLabel(status) {
  return String(status || 'manual').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function docTypeLabel(type) {
  return {
    invoice_pdf: 'Invoice PDF',
    invoice_xml: 'Invoice XML',
    guide_pdf: 'Guide PDF',
    guide_xml: 'Guide XML',
    cdr: 'CDR',
    pod: 'POD',
    external_portal_receipt: 'External Portal Receipt',
  }[type] || String(type).replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">External Customer Portals</h1>
        <p class="page-subtitle">Operational checklist for external customer portal requirements and manual upload tasks.</p>
      </div>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>Nexa records portal requirements and manual upload tasks so documents can be completed before customer deadlines.</div>
    </div>

    <div class="customer-portals-grid">
      <section v-for="row in portalRows" :key="row.portal.id" class="flow-panel customer-portal-card">
        <div class="flow-panel-head">
          <div class="customer-portal-title">
            <h2>{{ row.portal.name }}</h2>
            <p>{{ row.client?.businessName || row.client?.commercialName }}</p>
          </div>
          <span class="badge badge-blue">{{ statusLabel(row.portal.integrationStatus || 'manual') }}</span>
        </div>
        <div class="flow-stack">
          <div>
            <div class="meta-label">Required Business Documents</div>
            <div class="document-type-list">
              <span v-for="doc in row.requirements?.requiredDocumentTypes || []" :key="doc" :class="'badge ' + documentStatusBadge('pending')">
                {{ docTypeLabel(doc) }}
              </span>
            </div>
          </div>
          <div>
            <div class="meta-label">Upload Tasks</div>
            <div v-if="!row.tasks.length" class="muted-text" style="margin-top:6px">No pending tasks.</div>
            <div v-for="task in row.tasks" :key="task.id" class="mini-row customer-portal-task">
              <span class="mono">{{ task.orderId }}</span>
              <span :class="'badge ' + (task.status === 'completed' ? 'badge-green' : 'badge-amber')">{{ statusLabel(task.status) }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
