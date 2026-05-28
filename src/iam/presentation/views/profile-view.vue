<script setup>
import { computed, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

const toast = useToast();
const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const roleKey = computed(() => auth.user?.roleKey || 'commercial');
const isCommercial = computed(() => roleKey.value === 'commercial');
const isLogistics = computed(() => roleKey.value === 'logistics');
const company = computed(() => ds.D.company);
const profileKey = computed(() => `nexa.opsProfile.${auth.user?.id || 'demo'}`);
const saved = JSON.parse(localStorage.getItem(profileKey.value) || '{}');
const avatarPreview = ref(saved.avatarPreview || '');

const roleTitle = computed(() => {
  if (isLogistics.value) return 'Operations Manager';
  return 'Commercial Coordination';
});

const pageSubtitle = computed(() => {
  if (isLogistics.value) return 'Manage operations preferences and alert settings.';
  return 'Manage commercial workspace preferences, notifications and permissions.';
});

const form = reactive({
  fullName: saved.fullName || auth.user?.name || '',
  email: saved.email || auth.user?.email || '',
  phone: saved.phone || auth.user?.phone || '',
  preferredLanguage: saved.preferredLanguage || 'en',
  defaultWorkspace: saved.defaultWorkspace || (isLogistics.value ? 'Operations Dashboard' : 'Commercial Dashboard'),
});

const commercialNotifications = reactive({
  newRequests: saved.notifications?.newRequests ?? true,
  buyerReplies: saved.notifications?.buyerReplies ?? true,
  documentTasks: saved.notifications?.documentTasks ?? true,
});

const operationsNotifications = reactive({
  criticalStock: saved.notifications?.criticalStock ?? true,
  expiringLots: saved.notifications?.expiringLots ?? true,
  dispatchDelays: saved.notifications?.dispatchDelays ?? true,
  podPending: saved.notifications?.podPending ?? true,
  temperatureExceptions: saved.notifications?.temperatureExceptions ?? false,
});

const permissions = computed(() => {
  if (isLogistics.value) return ['Inventory Control', 'Dispatch Orders', 'Proof of Delivery', 'Operational Analytics', 'Company Administration'];
  return ['Purchase Requests', 'Manual Order Entry', 'B2B Clients', 'Business Documents', 'Stock availability view'];
});

function changePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  avatarPreview.value = URL.createObjectURL(file);
}

function saveProfile() {
  localStorage.setItem(profileKey.value, JSON.stringify({
    ...form,
    avatarPreview: avatarPreview.value,
    notifications: isLogistics.value ? { ...operationsNotifications } : { ...commercialNotifications },
  }));
  toast.add({ severity: 'success', summary: 'Profile saved', detail: 'Demo profile changes were stored locally.', life: 3000 });
}

function endSession() {
  auth.logout();
  router.push('/auth/login');
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">My Profile</div>
        <div class="page-subtitle">{{ pageSubtitle }}</div>
      </div>
      <div class="profile-hero-actions">
        <button class="btn btn-primary" @click="saveProfile"><i class="pi pi-check"></i> Save Profile</button>
        <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
        <button class="btn btn-ghost" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
      </div>
    </div>

    <section class="profile-hero">
      <div class="profile-avatar-xl">
        <img v-if="avatarPreview" :src="avatarPreview" alt="Profile avatar preview" />
        <span v-else>{{ auth.user?.initials || 'NX' }}</span>
      </div>
      <div class="profile-hero-copy">
        <div class="demo-label">{{ roleTitle }}</div>
        <h1>{{ form.fullName }}</h1>
        <p>{{ company.legalName }} · {{ company.name }}</p>
      </div>
      <label class="btn btn-secondary">
        <i class="pi pi-camera"></i> Change photo
        <input type="file" accept="image/*" class="sr-only" @change="changePhoto" />
      </label>
    </section>

    <div class="profile-grid">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Personal Information</div>
            <div class="flow-subtitle">Basic account fields for this demo user.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Full name</span><input class="plain-input" v-model="form.fullName" /></label>
          <label class="field"><span class="field-label">Email</span><input class="plain-input" v-model="form.email" disabled /></label>
          <label class="field"><span class="field-label">Phone</span><input class="plain-input" v-model="form.phone" placeholder="+51 999 000 000" /></label>
          <label class="field"><span class="field-label">Role</span><input class="plain-input" :value="roleTitle" disabled /></label>
          <label class="field span-full"><span class="field-label">Assigned company / tenant</span><input class="plain-input" :value="company.legalName" disabled /></label>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head"><div><div class="flow-title">Work Preferences</div><div class="flow-subtitle">Workspace defaults and language.</div></div></div>
        <div class="flow-panel-pad flow-stack">
          <label class="field"><span class="field-label">Preferred language</span><select class="plain-select" v-model="form.preferredLanguage"><option value="en">English</option><option value="es">Spanish</option></select></label>
          <label class="field"><span class="field-label">Default workspace</span><select class="plain-select" v-model="form.defaultWorkspace"><option>Commercial Dashboard</option><option>Operations Dashboard</option><option>Dispatch Orders</option><option>Business Documents</option></select></label>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">{{ isLogistics ? 'Operations Preferences' : 'Notification Preferences' }}</div>
            <div class="flow-subtitle">Demo alerts only. No production notification service is connected.</div>
          </div>
        </div>
        <div v-if="isLogistics" class="flow-panel-pad toggle-list">
          <label class="toggle-row"><span>Critical stock alerts</span><input type="checkbox" v-model="operationsNotifications.criticalStock" /></label>
          <label class="toggle-row"><span>Expiring lots alerts</span><input type="checkbox" v-model="operationsNotifications.expiringLots" /></label>
          <label class="toggle-row"><span>Dispatch delays</span><input type="checkbox" v-model="operationsNotifications.dispatchDelays" /></label>
          <label class="toggle-row"><span>POD pending alerts</span><input type="checkbox" v-model="operationsNotifications.podPending" /></label>
          <label class="toggle-row"><span>Temperature exception alerts</span><input type="checkbox" v-model="operationsNotifications.temperatureExceptions" /></label>
        </div>
        <div v-else class="flow-panel-pad toggle-list">
          <label class="toggle-row"><span>New purchase requests</span><input type="checkbox" v-model="commercialNotifications.newRequests" /></label>
          <label class="toggle-row"><span>Buyer replies</span><input type="checkbox" v-model="commercialNotifications.buyerReplies" /></label>
          <label class="toggle-row"><span>Document tasks</span><input type="checkbox" v-model="commercialNotifications.documentTasks" /></label>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head"><div><div class="flow-title">{{ isCommercial ? 'Commercial Scope' : isLogistics ? 'Operations Scope' : 'Demo Supervisor Scope' }}</div><div class="flow-subtitle">Visual permission summary for academic demo.</div></div></div>
        <div class="flow-panel-pad permission-grid">
          <div v-for="permission in permissions" :key="permission" class="permission-chip"><i class="pi pi-check-circle"></i>{{ permission }}</div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head"><div><div class="flow-title">Security / Demo Access</div><div class="flow-subtitle">Authentication is simulated for v1. Password update is a visual placeholder.</div></div></div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Current password</span><input class="plain-input" type="password" placeholder="••••••••" /></label>
          <label class="field"><span class="field-label">New password</span><input class="plain-input" type="password" placeholder="Demo only" /></label>
          <div class="banner banner-info span-full" style="margin:0">
            <i class="pi pi-info-circle"></i>
            <div>No production authentication, password recovery or user management is connected in this frontend v1 demo.</div>
          </div>
          <div class="span-full profile-account-actions">
            <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
            <button class="btn btn-ghost" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
