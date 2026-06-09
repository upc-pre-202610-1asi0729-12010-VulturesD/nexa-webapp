<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const clientId = computed(() => auth.user?.clientId || '');
const clientOrders = computed(() => ds.D.purchaseOrders.filter(order => order.clientId === clientId.value));
const clientInvoices = computed(() => ds.D.businessDocuments.filter(document => document.clientId === clientId.value));
const client = computed(() => ds.clientById(clientId.value));
const contact = computed(() => ds.contactByClientId(clientId.value));
const initials = computed(() => auth.user?.initials || auth.user?.name?.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'BP');

function endSession() {
  auth.logout();
  router.push('/auth/login');
}
</script>

<template>
  <div class="buyer-profile">
    <section class="page-header">
      <div>
        <span class="eyebrow">Buyer Portal</span>
        <h1>Buyer Profile</h1>
        <p>Buyer identity comes from authenticated access; client profile details are shown for the current workspace.</p>
      </div>
    </section>

    <section class="profile-hero buyer-profile-hero">
      <div class="profile-avatar-xl">
        <span>{{ initials }}</span>
      </div>
      <div class="profile-hero-copy">
        <div class="flow-pill flow-pill-blue">B2B buyer</div>
        <h1>{{ auth.user?.name || 'Buyer account' }}</h1>
        <p>{{ auth.user?.email }} · Client {{ clientId || 'pending assignment' }}</p>
      </div>
      <div class="profile-hero-actions">
        <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
        <button class="btn btn-logout-contrast" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
      </div>
    </section>

    <div class="profile-grid">
      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Account Summary</div>
            <div class="flow-subtitle">Read-only buyer data available from current session and backend order records.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Full name</span><input class="plain-input" :value="auth.user?.name" disabled /></label>
          <label class="field"><span class="field-label">Email</span><input class="plain-input" :value="auth.user?.email" disabled /></label>
          <label class="field"><span class="field-label">Client identifier</span><input class="plain-input" :value="clientId || 'Pending'" disabled /></label>
          <label class="field"><span class="field-label">Role</span><input class="plain-input" :value="auth.user?.roleName || 'B2B Buyer'" disabled /></label>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Current Backend Activity</div>
            <div class="flow-subtitle">Real orders and invoices linked to this buyer account.</div>
          </div>
        </div>
        <div class="flow-panel-pad buyer-kpi-grid">
          <div class="credit-summary-box">
            <div class="mini-row"><span class="meta-label">Orders</span><strong>{{ clientOrders.length }}</strong></div>
            <div class="flow-note">Purchase orders loaded from Nexa backend.</div>
          </div>
          <div class="credit-summary-box">
            <div class="mini-row"><span class="meta-label">Invoices</span><strong>{{ clientInvoices.length }}</strong></div>
            <div class="flow-note">Billing documents loaded from Nexa backend.</div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Client Profile</div>
            <div class="flow-subtitle">Local B2B account metadata for buyer portal presentation.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Company</span><input class="plain-input" :value="client?.businessName || clientId" disabled /></label>
          <label class="field"><span class="field-label">RUC</span><input class="plain-input" :value="client?.ruc || 'N/A'" disabled /></label>
          <label class="field"><span class="field-label">Primary contact</span><input class="plain-input" :value="contact?.name || auth.user?.name" disabled /></label>
          <label class="field"><span class="field-label">Delivery address</span><input class="plain-input" :value="client?.address || 'Local profile unavailable'" disabled /></label>
          <div class="banner banner-info span-full" style="margin:0">
            <i class="pi pi-info-circle"></i>
            <div>Editable buyer profile updates remain local-only until a backend profile endpoint is exposed.</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
