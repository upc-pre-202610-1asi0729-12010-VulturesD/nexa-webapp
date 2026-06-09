<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

const ds = useDataStore();
const company = computed(() => ds.D.company || {});
const users = computed(() => ds.D.users || []);
const subscription = computed(() => ds.D.subscriptions[0] || null);
</script>

<template>
  <div class="company-admin-page">
    <div class="page-header">
      <div>
        <div class="page-title">Company Administration</div>
        <div class="page-subtitle">Company administration workspace for users, subscription scope, and operational permissions.</div>
      </div>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>Authentication remains enforced. Company users and subscription settings are available in read-only workspace mode.</div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Company Identity</div>
            <div class="flow-subtitle">Read-only local application identity.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field span-full"><span class="field-label">Legal name</span><input class="plain-input" :value="company.legalName" disabled /></label>
          <label class="field"><span class="field-label">Display name</span><input class="plain-input" :value="company.name" disabled /></label>
          <label class="field"><span class="field-label">Country</span><input class="plain-input" :value="company.country" disabled /></label>
          <label class="field"><span class="field-label">Plan</span><input class="plain-input" :value="subscription?.plan || company.subscriptionPlan" disabled /></label>
          <label class="field"><span class="field-label">Seats</span><input class="plain-input" :value="subscription?.seats || 'N/A'" disabled /></label>
        </div>
      </section>

      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Team Access</div>
            <div class="flow-subtitle">Team roster for operational access review.</div>
          </div>
        </div>
        <div class="flow-panel-pad">
          <div v-if="users.length" class="team-access-list">
            <article v-for="member in users" :key="member.id" class="team-access-card">
              <div class="avatar">{{ member.initials || 'NX' }}</div>
              <div class="team-access-main">
                <strong>{{ member.name }}</strong>
                <span>{{ member.roleName || member.role }}</span>
                <small>{{ member.email }}</small>
              </div>
              <span :class="'badge ' + (member.status === 'active' ? 'badge-green' : 'badge-gray')">{{ member.status || 'read only' }}</span>
            </article>
          </div>
          <div v-else class="empty-state compact">
            <div class="empty-state-icon"><i class="pi pi-users"></i></div>
            <div class="empty-state-title">Team roster unavailable</div>
            <div class="empty-state-desc">Run npm run server to load optional local company users.</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
