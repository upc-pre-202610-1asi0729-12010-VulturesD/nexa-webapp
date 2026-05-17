<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { documentStatusLabel, documentStatusBadge, orderStatusLabel, orderStatusBadge } from '@/shared/status';

const ds = useDataStore();
const D = ds.D;
const selectedOrderId = ref('');

const ordersWithDocs = computed(() =>
  D.purchaseOrders
    .map(order => ({
      ...order,
      docs: ds.documentsForOrder(order.id),
      task: ds.uploadTaskForOrder(order.id),
    }))
    .filter(order => order.docs.length)
);

const selectedOrder = computed(() =>
  ordersWithDocs.value.find(order => order.id === selectedOrderId.value) || ordersWithDocs.value[0]
);

const selectedDocs = computed(() => selectedOrder.value?.docs || []);
const pendingCount = computed(() => D.businessDocuments.filter(doc => doc.required && ['pending', 'observed', 'rejected'].includes(doc.status)).length);
const acceptedCount = computed(() => D.businessDocuments.filter(doc => ['accepted', 'uploaded', 'generated'].includes(doc.status)).length);

function nextStatus(doc) {
  const order = ['pending', 'generated', 'uploaded', 'accepted'];
  const current = order.indexOf(doc.status);
  return order[Math.min(current + 1, order.length - 1)] || 'generated';
}

function advance(doc) {
  ds.updateDocumentStatus(doc.id, nextStatus(doc));
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Business Documents</div>
      <div class="page-subtitle">Invoices, guides, CDR, POD and manual upload tasks for external customer portals.</div>
    </div>
    <span class="demo-label">Reference document</span>
  </div>

  <div class="grid-3" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B"></i> Pending</div>
      <div class="kpi-value" style="color:#F59E0B">{{ pendingCount }}</div>
      <div class="kpi-sub">Require S1 action</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-check" style="color:#16A34A"></i> Visible or accepted</div>
      <div class="kpi-value" style="color:#16A34A">{{ acceptedCount }}</div>
      <div class="kpi-sub">Available for tracking</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-upload" style="color:#2563EB"></i> External portals</div>
      <div class="kpi-value" style="color:#2563EB">{{ D.portalUploadTasks.length }}</div>
      <div class="kpi-sub">Manual checklist, no real integration</div>
    </div>
  </div>

  <div class="flow-grid-12">
    <section class="flow-panel span-4">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Purchase Orders with Documents</div>
          <div class="flow-subtitle">Select a purchase order to review the checklist.</div>
        </div>
      </div>
      <div class="flow-panel-pad">
        <button
          v-for="order in ordersWithDocs"
          :key="order.id"
          class="flow-list-item"
          style="width:100%;background:transparent;border-left:none;border-right:none;border-top:none;text-align:left;cursor:pointer"
          :style="selectedOrder?.id === order.id ? 'background:#EFF6FF;border-radius:10px;padding-left:10px;padding-right:10px' : ''"
          @click="selectedOrderId = order.id"
        >
          <div>
            <div class="flow-row">
              <span class="mono">{{ order.id }}</span>
              <span :class="'badge ' + orderStatusBadge(order.status)">{{ orderStatusLabel(order.status) }}</span>
            </div>
            <div class="flow-note">{{ ds.clientName(order.clientId) }}</div>
          </div>
          <span class="flow-pill">{{ order.docs.filter(doc => doc.required && doc.status !== 'not_required').length }}/{{ order.docs.length }}</span>
        </button>
      </div>
    </section>

    <section class="flow-panel span-8" v-if="selectedOrder">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">{{ selectedOrder.id }} - {{ ds.clientName(selectedOrder.clientId) }}</div>
          <div class="flow-subtitle">Document profile: {{ ds.clientById(selectedOrder.clientId)?.documentProfile || 'standard_docs' }}</div>
        </div>
        <span :class="'badge ' + orderStatusBadge(selectedOrder.status)">{{ orderStatusLabel(selectedOrder.status) }}</span>
      </div>
      <div class="flow-panel-pad">
        <div v-if="selectedOrder.task" class="banner banner-warning">
          <i class="pi pi-upload"></i>
          <div>
            <strong>External portal task:</strong> {{ selectedOrder.task.status }} - due {{ selectedOrder.task.dueDate }}.
            This is a simulated manual upload, not a real integration.
          </div>
        </div>

        <div class="flow-stack">
          <div v-for="doc in selectedDocs" :key="doc.id" class="document-check">
            <div>
              <div style="font-size:13px;font-weight:800">{{ doc.label }}</div>
              <div class="flow-note">
                {{ doc.required ? 'Required' : 'Not required' }} -
                {{ doc.visibleToBuyer ? 'visible to S3' : 'internal until completed' }}
              </div>
            </div>
            <div class="flow-row">
              <span :class="'badge ' + documentStatusBadge(doc.status)">{{ documentStatusLabel(doc.status) }}</span>
              <button
                class="btn btn-secondary btn-sm"
                :disabled="doc.status === 'accepted' || doc.status === 'not_required'"
                @click="advance(doc)"
              >
                Mark Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
