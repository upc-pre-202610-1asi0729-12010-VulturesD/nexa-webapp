<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, orderStatusLabel, orderStatusBadge, documentStatusBadge } from '@/shared/status';

const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const newRequests = computed(() => D.purchaseRequests.filter(r => ['submitted', 'in_review', 'needs_adjustment'].includes(r.status)));
const blockedOrders = computed(() => D.purchaseOrders.filter(o => ['blocked', 'incident'].includes(o.status)));
const validatingOrders = computed(() => D.purchaseOrders.filter(o => ['validating', 'document_pending'].includes(o.status)));
const pendingDocs = computed(() => D.businessDocuments.filter(doc => doc.required && ['pending', 'observed', 'rejected'].includes(doc.status)));
const pendingPortalTasks = computed(() => D.portalUploadTasks.filter(task => ['pending', 'blocked'].includes(task.status)));
const recentActivity = computed(() => D.activityLog.slice(0, 7));
const requestPreview = computed(() => newRequests.value.slice(0, 5));
const docsPreview = computed(() => pendingDocs.value.slice(0, 6));
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Commercial Dashboard</div>
      <div class="page-subtitle">Review buyer requests, validation tasks and document workload.</div>
    </div>
    <div class="flow-row">
      <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-requests')">
        <i class="pi pi-inbox"></i> Purchase Requests
      </button>
      <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
        <i class="pi pi-plus"></i> Manual Order Entry
      </button>
    </div>
  </div>

  <div class="flow-action-banner">
    <div>
      <div class="flow-eyebrow">S3 requests -> S1 validates/documents</div>
      <div class="flow-title">There are {{ newRequests.length }} requests and {{ pendingDocs.length }} documents requiring commercial action.</div>
      <div class="flow-note">Prioritize credit, availability, document profile and manual external portal upload.</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/business-documents')">
      <i class="pi pi-file-check"></i> Business Documents
    </button>
  </div>

  <div class="grid-4" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-inbox" style="color:#2563EB"></i> New Purchase Requests</div>
        <div class="flow-kpi-icon"><i class="pi pi-inbox"></i></div>
      </div>
      <div class="kpi-value" style="color:#2563EB">{{ newRequests.length }}</div>
      <div class="kpi-sub">Buyer Portal and manual entries</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-search" style="color:#F59E0B"></i> In validation</div>
        <div class="flow-kpi-icon" style="background:#FEF3C7;color:#B45309"><i class="pi pi-search"></i></div>
      </div>
      <div class="kpi-value" style="color:#F59E0B">{{ validatingOrders.length }}</div>
      <div class="kpi-sub">Purchase orders with pending conditions</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-file" style="color:#0891B2"></i> Pending Docs</div>
        <div class="flow-kpi-icon" style="background:#ECFEFF;color:#0891B2"><i class="pi pi-file"></i></div>
      </div>
      <div class="kpi-value" style="color:#0891B2">{{ pendingDocs.length }}</div>
      <div class="kpi-sub">{{ pendingPortalTasks.length }} external portal tasks</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-ban" style="color:#EF4444"></i> Blocked</div>
        <div class="flow-kpi-icon" style="background:#FEE2E2;color:#B91C1C"><i class="pi pi-ban"></i></div>
      </div>
      <div class="kpi-value" style="color:#EF4444">{{ blockedOrders.length }}</div>
      <div class="kpi-sub">Credit, stock or incident</div>
    </div>
  </div>

  <div class="flow-grid-12">
    <section class="flow-panel span-7">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Request Inbox</div>
          <div class="flow-subtitle">Buyer purchase requests requiring S1 validation.</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="router.push('/ops/commercial/purchase-requests')">View All</button>
      </div>
      <div class="flow-panel-pad">
        <div v-for="request in requestPreview" :key="request.id" class="flow-list-item">
          <div>
            <div class="flow-row" style="margin-bottom:5px">
              <span class="mono">{{ request.id }}</span>
              <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
              <span :class="'badge-priority-' + (request.priority === 'normal' ? 'medium' : request.priority)">{{ request.priority }}</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:#0F172A">{{ ds.clientName(request.clientId) }}</div>
            <div class="flow-note">{{ request.comments }}</div>
          </div>
          <button class="btn btn-primary btn-sm" @click="router.push('/ops/commercial/purchase-requests/' + request.id)">Review</button>
        </div>
      </div>
    </section>

    <section class="flow-panel span-5">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Pending Business Documents</div>
          <div class="flow-subtitle">Operational checklist by purchase order and external portal.</div>
        </div>
      </div>
      <div class="flow-panel-pad">
        <div v-for="doc in docsPreview" :key="doc.id" class="document-check">
          <div>
            <div style="font-size:13px;font-weight:700">{{ doc.label }}</div>
            <div class="flow-note">{{ doc.orderId }} - {{ ds.clientName(doc.clientId) }}</div>
          </div>
          <span :class="'badge ' + documentStatusBadge(doc.status)">{{ doc.status }}</span>
        </div>
      </div>
    </section>

    <section class="flow-panel span-4">
      <div class="flow-panel-head"><div class="flow-title">Quick Actions</div></div>
      <div class="flow-panel-pad flow-stack">
        <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')"><i class="pi pi-plus"></i> Manual Order Entry</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-requests')"><i class="pi pi-inbox"></i> Purchase Requests</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-orders')"><i class="pi pi-file-edit"></i> Purchase Orders</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/client-accounts')"><i class="pi pi-users"></i> B2B Clients</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/business-documents')"><i class="pi pi-file-check"></i> Business Documents</button>
      </div>
    </section>

    <section class="flow-panel span-8">
      <div class="flow-panel-head">
        <div class="flow-title">Recent Commercial Activity</div>
        <span class="demo-label">Simulated data</span>
      </div>
      <div class="flow-panel-pad">
        <div v-for="item in recentActivity" :key="item.id" class="activity-item">
          <div :class="'activity-dot'" :style="{ background: item.type === 'danger' ? '#EF4444' : item.type === 'warning' ? '#F59E0B' : item.type === 'success' ? '#22C55E' : '#2563EB' }"></div>
          <div class="activity-text">{{ item.text }}</div>
          <div class="activity-time">{{ item.time }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
