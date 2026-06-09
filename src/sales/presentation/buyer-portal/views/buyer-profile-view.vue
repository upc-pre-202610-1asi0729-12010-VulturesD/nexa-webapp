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
        <p>Buyer identity is linked to the authenticated account. Editable buyer profile fields are pending backend support.</p>
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
            <div class="flow-title">Profile Management</div>
            <div class="flow-subtitle">Delivery preferences, notification preferences and editable buyer metadata need backend profile endpoints.</div>
          </div>
        </div>
        <div class="flow-panel-pad">
          <div class="empty-state compact">
            <div class="empty-state-icon"><i class="pi pi-user-edit"></i></div>
            <div class="empty-state-title">Buyer profile editing pending</div>
            <div class="empty-state-desc">This module is pending backend support and will be enabled in a future integration cycle.</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
