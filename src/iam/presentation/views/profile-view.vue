<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const roleKey = computed(() => auth.user?.roleKey || 'commercial');
const roleTitle = computed(() => roleKey.value === 'logistics' ? 'Operations Manager' : 'Commercial Coordination');
const company = computed(() => ds.D.company);
const permissions = computed(() => {
  if (roleKey.value === 'logistics') return ['Inventory Control', 'Dispatch Orders', 'Proof of Delivery', 'Operational Analytics'];
  return ['Product Catalog', 'Purchase Orders', 'Manual Order Entry', 'Business Documents'];
});
const preferences = computed(() => [
  { label: 'Language', value: auth.user?.preferredLanguage || 'en' },
  { label: 'Department', value: auth.user?.department || roleTitle.value },
  { label: 'Plan access', value: auth.user?.planAccess || 'standard' },
]);

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
        <div class="page-subtitle">Account details come from Nexa authentication. Preferences below are local read-only presentation data.</div>
      </div>
      <div class="profile-account-actions">
        <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
        <button class="btn btn-ghost" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
      </div>
    </div>

    <section class="profile-hero">
      <div class="profile-avatar-xl">
        <span>{{ auth.user?.initials || 'NX' }}</span>
      </div>
      <div class="profile-hero-copy">
        <div class="flow-pill flow-pill-blue">{{ roleTitle }}</div>
        <h1>{{ auth.user?.name || 'Nexa user' }}</h1>
        <p>{{ company.legalName }} · {{ auth.user?.email }}</p>
      </div>
    </section>

    <div class="profile-grid">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Account Information</div>
            <div class="flow-subtitle">Read-only session profile from the real authentication flow.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Full name</span><input class="plain-input" :value="auth.user?.name" disabled /></label>
          <label class="field"><span class="field-label">Email</span><input class="plain-input" :value="auth.user?.email" disabled /></label>
          <label class="field"><span class="field-label">Role</span><input class="plain-input" :value="auth.user?.roleName || roleTitle" disabled /></label>
          <label class="field"><span class="field-label">Workspace</span><input class="plain-input" :value="auth.scope" disabled /></label>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Workspace Preferences</div>
            <div class="flow-subtitle">Read-only profile metadata for current AV2 workspace.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="preference in preferences" :key="preference.label" class="mini-row">
            <span>{{ preference.label }}</span>
            <strong>{{ preference.value }}</strong>
          </div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Operational Scope</div>
            <div class="flow-subtitle">Permission summary for the current workspace profile.</div>
          </div>
        </div>
        <div class="flow-panel-pad permission-grid">
          <div v-for="permission in permissions" :key="permission" class="permission-chip">
            <i class="pi pi-check-circle"></i>{{ permission }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
