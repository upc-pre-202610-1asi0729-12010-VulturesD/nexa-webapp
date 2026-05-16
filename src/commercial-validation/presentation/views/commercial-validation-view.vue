<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, coldTypeLabel, coldTypeBadge, documentStatusLabel, documentStatusBadge } from '@/shared/status';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const ds = useDataStore();

const comment = ref('');

const request = computed(() => ds.purchaseRequestById(route.params.id));
const client = computed(() => request.value ? ds.clientById(request.value.clientId) : null);
const items = computed(() => request.value ? ds.requestItemsFor(request.value.id) : []);
const portal = computed(() => client.value ? ds.portalForClient(client.value.id) : null);
const requirements = computed(() => client.value ? ds.portalRequirementsForClient(client.value.id)?.requiredDocumentTypes || [] : []);
const messages = computed(() => request.value ? ds.messagesForRequest(request.value.id) : []);
const convertedOrder = computed(() => request.value?.convertedOrderId ? ds.purchaseOrderById(request.value.convertedOrderId) : null);

const availabilityRows = computed(() => items.value.map((item) => {
  const product = ds.productById(item.productId) || {};
  const available = Number(product.stock || 0) - Number(product.reserved || 0);
  return {
    item,
    product,
    available,
    ok: available >= Number(item.quantity || 0),
  };
}));

const hasStockIssues = computed(() => availabilityRows.value.some(row => !row.ok));
const isCreditBlocked = computed(() => client.value?.creditStatus === 'blocked' || (client.value?.creditLimit && client.value.creditUsed >= client.value.creditLimit));

function approve() {
  ds.updateRequestStatus(request.value.id, 'approved');
  toast.add({ severity: 'success', summary: 'Request approved', detail: request.value.id, life: 3000 });
}

function requestChanges() {
  ds.updateRequestStatus(request.value.id, 'needs_adjustment');
  ds.addMessage({
    requestId: request.value.id,
    senderRole: 'commercial',
    senderName: 'Valeria Sanchez',
    body: comment.value || 'Please adjust quantities or confirm the requested delivery conditions before validation.',
  });
  comment.value = '';
  toast.add({ severity: 'warn', summary: 'Adjustment requested', detail: request.value.id, life: 3000 });
}

function reject() {
  ds.updateRequestStatus(request.value.id, 'rejected');
  toast.add({ severity: 'warn', summary: 'Request rejected', detail: request.value.id, life: 3000 });
}

function convert() {
  if (isCreditBlocked.value || hasStockIssues.value) {
    toast.add({ severity: 'warn', summary: 'Incomplete validation', detail: 'Review credit and availability before converting.', life: 3500 });
    return;
  }
  if (!['approved', 'converted_to_order'].includes(request.value.status)) approve();
  const order = ds.convertRequestToOrder(request.value.id);
  toast.add({ severity: 'success', summary: 'Purchase order created', detail: order.id, life: 3500 });
  router.push('/ops/commercial/purchase-orders/' + order.id);
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
  <div v-if="!request" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">Request not found</div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/purchase-requests')">Back to inbox</button>
  </div>

  <template v-else>
    <div class="page-header">
      <div>
        <div class="flow-row" style="margin-bottom:5px">
          <button class="btn btn-ghost btn-sm" @click="router.push('/ops/commercial/purchase-requests')"><i class="pi pi-arrow-left"></i> Inbox</button>
          <span class="page-title mono">{{ request.id }}</span>
          <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
        </div>
        <div class="page-subtitle">{{ ds.clientName(request.clientId) }} - requested delivery {{ request.requestedDeliveryDate }}</div>
      </div>
      <div class="flow-row">
        <button class="btn btn-secondary" @click="requestChanges"><i class="pi pi-comment"></i> Request Adjustment</button>
        <button class="btn btn-danger" @click="reject"><i class="pi pi-times"></i> Reject</button>
        <button class="btn btn-primary" @click="convert"><i class="pi pi-check"></i> Convert to Purchase Order</button>
      </div>
    </div>

    <div v-if="convertedOrder" class="banner banner-success">
      <i class="pi pi-check-circle"></i>
      <div>Request converted into <strong>{{ convertedOrder.id }}</strong>. A dispatch order card already exists for S2.</div>
    </div>
    <div v-else-if="isCreditBlocked" class="banner banner-danger">
      <i class="pi pi-ban"></i>
      <div>Client has blocked credit. Do not convert to a final purchase order until the commercial condition is regularized.</div>
    </div>
    <div v-else-if="hasStockIssues" class="banner banner-warning">
      <i class="pi pi-exclamation-triangle"></i>
      <div>Some lines have partial availability. S1 must adjust quantities or propose a replacement before conversion.</div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-4">
        <div class="flow-panel-head"><div class="flow-title">Validated Client</div></div>
        <div class="flow-panel-pad flow-stack" v-if="client">
          <div>
            <div class="flow-eyebrow">RUC</div>
            <div style="font-size:16px;font-weight:800">{{ client.ruc }}</div>
          </div>
          <div>
            <div class="flow-eyebrow">Business Name</div>
            <div style="font-size:14px;font-weight:700">{{ client.businessName || client.name }}</div>
            <div class="flow-note">{{ client.contact }} - {{ client.phone }}</div>
          </div>
          <div class="flow-row-between">
            <span>Payment Condition</span>
            <strong>{{ client.condition }}</strong>
          </div>
          <div class="flow-row-between">
            <span>Credit Status</span>
            <span :class="'badge ' + (isCreditBlocked ? 'badge-red' : client.creditStatus === 'attention' ? 'badge-amber' : 'badge-green')">
              {{ isCreditBlocked ? 'Blocked' : client.creditStatus || 'ok' }}
            </span>
          </div>
          <div v-if="portal">
            <div class="flow-eyebrow">External Portal</div>
            <div class="flow-row-between">
              <span>{{ portal.name }}</span>
              <span class="flow-pill flow-pill-amber">Manual upload</span>
            </div>
            <div class="flow-note">{{ portal.notes }}</div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-8">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Requested Products and Availability</div>
            <div class="flow-subtitle">S3 requests; S1 validates commercial availability before confirmation.</div>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Product</th><th>Cold Chain</th><th>Quantity</th><th>Internal Availability</th><th>Result</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in availabilityRows" :key="row.item.id">
              <td>
                <div style="font-weight:700">{{ row.product.name }}</div>
                <div class="flow-note">{{ row.product.sku }} - {{ row.item.notes }}</div>
              </td>
              <td><span :class="coldTypeBadge(row.product.coldType)">{{ coldTypeLabel(row.product.coldType) }}</span></td>
              <td>{{ row.item.quantity }} {{ row.item.unit }} <span class="flow-note">({{ row.item.estimatedWeightKg }} kg)</span></td>
              <td>{{ row.available }} {{ row.product.unit }}</td>
              <td><span :class="'badge ' + (row.ok ? 'badge-green' : 'badge-red')">{{ row.ok ? 'Available' : 'Partial stock' }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div class="flow-title">Document Checklist</div>
          <span class="demo-label">External portal not integrated</span>
        </div>
        <div class="flow-panel-pad">
          <div v-if="requirements.length">
            <div v-for="type in requirements" :key="type" class="document-check">
              <div>
                <div style="font-weight:700">{{ docTypeLabel(type) }}</div>
                <div class="flow-note">Required by {{ portal?.name || 'client profile' }}</div>
              </div>
              <span :class="'badge ' + documentStatusBadge('pending')">{{ documentStatusLabel('pending') }}</span>
            </div>
          </div>
          <div v-else class="flow-note">Client has no special external document profile.</div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head"><div class="flow-title">S1 - S3 Comments</div></div>
        <div class="flow-panel-pad">
          <div v-for="message in messages" :key="message.id" class="flow-list-item">
            <div>
              <div class="flow-row">
                <strong>{{ message.senderName }}</strong>
                <span class="flow-pill">{{ message.senderRole }}</span>
              </div>
              <div class="flow-note">{{ message.body }}</div>
            </div>
          </div>
          <textarea v-model="comment" class="plain-textarea" placeholder="Write a response or adjustment for the buyer..."></textarea>
          <button class="btn btn-secondary" style="margin-top:10px" @click="requestChanges">
            <i class="pi pi-send"></i> Send Simulated Adjustment
          </button>
        </div>
      </section>
    </div>
  </template>
</template>
