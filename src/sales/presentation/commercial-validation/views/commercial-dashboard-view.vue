<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, documentStatusLabel, documentStatusBadge, priorityLabel, displayCode } from '@/shared/status';

const router = useRouter();
const { t } = useI18n();
const ds = useDataStore();
const D = ds.D;

const newRequests = computed(() => D.purchaseRequests.filter(r => ['submitted', 'in_review', 'needs_adjustment'].includes(r.status)));
const blockedOrders = computed(() => D.purchaseOrders.filter(o => ['blocked', 'incident'].includes(o.status)));
const validatingOrders = computed(() => D.purchaseOrders.filter(o => ['validating', 'document_pending'].includes(o.status)));
const pendingDocs = computed(() => D.businessDocuments.filter(doc => doc.required && ['pending', 'observed', 'rejected'].includes(doc.status)));
const pendingPortalTasks = computed(() => D.portalUploadTasks.filter(task => ['pending', 'blocked'].includes(task.status)));
const pendingCreditRequests = computed(() => D.creditRequests.filter(request => ['submitted', 'in_review'].includes(request.status)));
const recentActivity = computed(() => D.activityLog.slice(0, 7));
const requestPreview = computed(() => newRequests.value.slice(0, 5));
const docsPreview = computed(() => pendingDocs.value.slice(0, 6));
const creditRequestsPreview = computed(() => pendingCreditRequests.value.slice(0, 4));
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">{{ t('commercialDashboard.title') }}</div>
      <div class="page-subtitle">{{ t('commercialDashboard.subtitle') }}</div>
    </div>
    <div class="flow-row">
      <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-requests')">
        <i class="pi pi-inbox"></i> {{ t('commercialDashboard.requestsButton') }}
      </button>
      <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
        <i class="pi pi-plus"></i> {{ t('commercialDashboard.manualOrder') }}
      </button>
    </div>
  </div>

  <div class="flow-action-banner">
    <div>
      <div class="flow-eyebrow">{{ t('commercialDashboard.bannerEyebrow') }}</div>
      <div class="flow-title">{{ t('commercialDashboard.bannerTitle', { requests: newRequests.length, credit: pendingCreditRequests.length, documents: pendingDocs.length }) }}</div>
      <div class="flow-note">{{ t('commercialDashboard.bannerNote') }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/business-documents')">
      <i class="pi pi-file-check"></i> {{ t('commercialDashboard.businessDocuments') }}
    </button>
  </div>

  <div class="grid-4" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-inbox" style="color:#2563EB"></i> {{ t('commercialDashboard.newRequests') }}</div>
        <div class="flow-kpi-icon"><i class="pi pi-inbox"></i></div>
      </div>
      <div class="kpi-value" style="color:#2563EB">{{ newRequests.length }}</div>
      <div class="kpi-sub">{{ t('commercialDashboard.newRequestsSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-search" style="color:#F59E0B"></i> {{ t('commercialDashboard.inValidation') }}</div>
        <div class="flow-kpi-icon" style="background:#FEF3C7;color:#B45309"><i class="pi pi-search"></i></div>
      </div>
      <div class="kpi-value" style="color:#F59E0B">{{ validatingOrders.length }}</div>
      <div class="kpi-sub">{{ t('commercialDashboard.inValidationSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-file" style="color:#0891B2"></i> {{ t('commercialDashboard.pendingDocs') }}</div>
        <div class="flow-kpi-icon" style="background:#ECFEFF;color:#0891B2"><i class="pi pi-file"></i></div>
      </div>
      <div class="kpi-value" style="color:#0891B2">{{ pendingDocs.length }}</div>
      <div class="kpi-sub">{{ t('commercialDashboard.pendingDocsSub', { count: pendingPortalTasks.length }) }}</div>
    </div>
    <div class="card kpi-card">
      <div class="flow-row-between">
        <div class="kpi-label"><i class="pi pi-ban" style="color:#EF4444"></i> {{ t('commercialDashboard.blocked') }}</div>
        <div class="flow-kpi-icon" style="background:#FEE2E2;color:#B91C1C"><i class="pi pi-ban"></i></div>
      </div>
      <div class="kpi-value" style="color:#EF4444">{{ blockedOrders.length }}</div>
      <div class="kpi-sub">{{ t('commercialDashboard.blockedSub') }}</div>
    </div>
  </div>

  <div class="flow-grid-12">
    <section class="flow-panel span-7">
      <div class="flow-panel-head">
          <div>
          <div class="flow-title">{{ t('commercialDashboard.requestInbox') }}</div>
          <div class="flow-subtitle">{{ t('commercialDashboard.requestInboxSub') }}</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="router.push('/ops/commercial/purchase-requests')">{{ t('commercialDashboard.viewAll') }}</button>
      </div>
      <div class="flow-panel-pad">
        <div v-for="request in requestPreview" :key="request.id" class="flow-list-item">
          <div>
            <div class="flow-row" style="margin-bottom:5px">
              <span class="mono">{{ displayCode(request) }}</span>
              <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
              <span :class="'badge-priority-' + (request.priority === 'normal' ? 'medium' : request.priority)">{{ priorityLabel(request.priority === 'normal' ? 'medium' : request.priority) }}</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:#0F172A">{{ ds.clientName(request.clientId) }}</div>
            <div class="flow-note">{{ request.comments }}</div>
          </div>
          <button class="btn btn-primary btn-sm" @click="router.push('/ops/commercial/purchase-requests/' + request.id)">{{ t('common.review') }}</button>
        </div>
      </div>
    </section>

    <section class="flow-panel span-5">
      <div class="flow-panel-head">
          <div>
          <div class="flow-title">{{ t('commercialDashboard.pendingBusinessDocs') }}</div>
          <div class="flow-subtitle">{{ t('commercialDashboard.pendingBusinessDocsSub') }}</div>
        </div>
      </div>
      <div class="flow-panel-pad">
        <div v-for="doc in docsPreview" :key="doc.id" class="document-check">
          <div>
            <div style="font-size:13px;font-weight:700">{{ doc.label }}</div>
            <div class="flow-note">{{ doc.orderId }} - {{ ds.clientName(doc.clientId) }}</div>
          </div>
          <span :class="'badge ' + documentStatusBadge(doc.status)">{{ documentStatusLabel(doc.status) }}</span>
        </div>
      </div>
    </section>

    <section class="flow-panel span-4">
      <div class="flow-panel-head">
          <div>
          <div class="flow-title">{{ t('commercialDashboard.creditRequests') }}</div>
          <div class="flow-subtitle">{{ t('commercialDashboard.creditRequestsSub') }}</div>
        </div>
      </div>
      <div class="flow-panel-pad flow-stack">
        <div v-for="request in creditRequestsPreview" :key="request.id" class="flow-list-item">
          <div>
            <div class="flow-row" style="margin-bottom:5px">
              <span class="mono">{{ request.id }}</span>
              <span class="badge badge-amber">{{ request.status }}</span>
            </div>
            <div style="font-size:13px;font-weight:800">{{ ds.clientName(request.clientId) }}</div>
            <div class="flow-note">{{ t('commercialDashboard.requestedAmount', { amount: Number(request.requestedAmount || 0).toLocaleString(), reason: request.reason }) }}</div>
          </div>
        </div>
        <div v-if="!creditRequestsPreview.length" class="flow-note">{{ t('commercialDashboard.noCreditRequests') }}</div>
      </div>
    </section>

    <section class="flow-panel span-4">
      <div class="flow-panel-head"><div class="flow-title">{{ t('commercialDashboard.quickActions') }}</div></div>
      <div class="flow-panel-pad flow-stack">
        <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')"><i class="pi pi-plus"></i> {{ t('commercialDashboard.manualOrder') }}</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-requests')"><i class="pi pi-inbox"></i> {{ t('commercialDashboard.requestsButton') }}</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/purchase-orders')"><i class="pi pi-file-edit"></i> {{ t('nav.orders') }}</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/client-accounts')"><i class="pi pi-users"></i> {{ t('nav.clients') }}</button>
        <button class="btn btn-secondary" @click="router.push('/ops/commercial/business-documents')"><i class="pi pi-file-check"></i> {{ t('commercialDashboard.businessDocuments') }}</button>
      </div>
    </section>

    <section class="flow-panel span-8">
      <div class="flow-panel-head">
        <div class="flow-title">{{ t('commercialDashboard.recentActivity') }}</div>
        <span class="demo-label">{{ t('commercialDashboard.operationalActivity') }}</span>
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
