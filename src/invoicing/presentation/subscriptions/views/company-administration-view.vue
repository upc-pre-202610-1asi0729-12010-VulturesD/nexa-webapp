<script setup>
import { computed, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';

const toast = useToast();
const ds = useDataStore();

const company = computed(() => ds.D.company || {});
const localKey = 'nexa.companyAdministration.TEN-001';
const saved = JSON.parse(localStorage.getItem(localKey) || '{}');
const logoPreview = ref(saved.logoPreview || '');
const teamOverrides = reactive(saved.teamOverrides || {});
const newUserForm = reactive({
  name: saved.newUserName || '',
  email: saved.newUserEmail || '',
  clientId: saved.newUserClientId || '',
});

const form = reactive({
  commercialName: saved.commercialName || company.value.name || 'ICISA Demo',
  mainLocation: saved.mainLocation || company.value.address || 'Av. Industrial 1240, Los Olivos, Lima',
  contactEmail: saved.contactEmail || 'operations@icisa.demo',
  phone: saved.phone || '+51 999 210 420',
  operatingZones: saved.operatingZones || 'Lima Norte, Callao, Lima Centro, Trujillo Norte',
  specialization: saved.specialization || 'Frozen seafood, chilled dairy, refrigerated cold cuts and FEFO dispatch control',
});

const teamMembers = computed(() =>
  ds.D.users
    .filter(user => user.roleKey !== 'admin' && user.segment !== 'ADMIN')
    .map(user => {
      const override = teamOverrides[user.id] || {};
      return {
        ...user,
        status: override.status || user.status || 'active',
        accessLevel: override.accessLevel || accessLevelFor(user.roleKey),
        lastActivity: override.lastActivity || lastActivityFor(user.roleKey),
      };
    })
);

const plans = [
  {
    key: 'starter',
    title: 'Starter',
    summary: 'Basic buyer visibility and document access.',
    features: ['Buyer order tracking', 'Business document visibility', 'Basic purchase order status', 'Catalog reference outside portal'],
  },
  {
    key: 'standard',
    title: 'Standard',
    summary: 'Core internal operations with buyer visibility.',
    features: ['Commercial Workspace', 'Operations Workspace', 'Manual purchase requests', 'Dispatch orders', 'Operational analytics', 'Company Administration'],
  },
  {
    key: 'premium',
    title: 'Premium',
    summary: 'Rich buyer-facing commercial experience.',
    features: ['Full Buyer Portal', 'Visual Product Catalog', 'Request Builder', 'Offers and promotions', 'Assistant preview', 'Advanced tracking preview'],
  },
  {
    key: 'enterprise',
    title: 'Enterprise / Dedicated',
    summary: 'Custom portal requirements and future integrations track.',
    features: ['External customer portal mapping', 'Custom document requirements', 'Dedicated configuration', 'Future integrations roadmap'],
  },
];

const currentPlan = computed(() => company.value.currentPlan || company.value.planId || company.value.subscriptionPlan || 'standard');
const currentSubscription = computed(() => ds.D.subscriptions.find(plan => plan.key === currentPlan.value || plan.id === currentPlan.value) || {});
const buyerClients = computed(() => ds.D.clients);
const inferredRole = computed(() => inferRoleFromEmail(newUserForm.email));

const featureGates = computed(() => {
  const features = currentSubscription.value.features || {};
  return [
    ['Buyer tracking', features.buyerTracking],
    ['Product Catalog', features.buyerCatalog],
    ['Request Builder', features.buyerRequestCreation || features.buyerCart],
    ['Business Documents', features.buyerDocuments],
    ['Customer Portal Requirements', features.externalPortalCompatibility],
    ['Promotions', features.promotions],
    ['AI Assistant Preview', features.aiAssistantPreview],
    ['Premium catalog experience', features.visualProductContent],
    ['External portal compatibility', features.externalPortalCompatibility],
  ];
});

function accessLevelFor(roleKey) {
  if (roleKey === 'logistics') return 'Company owner';
  if (roleKey === 'commercial') return 'Commercial operator';
  return 'Buyer portal access';
}

function lastActivityFor(roleKey) {
  if (roleKey === 'logistics') return 'Today';
  if (roleKey === 'commercial') return 'Today';
  return 'This week';
}

function segmentLabel(user) {
  if (user.segment === 'S1') return 'S1 — Commercial Coordination';
  if (user.segment === 'S2') return 'S2 — Logistics / Operations Management';
  return 'S3 — Buyer Portal';
}

function initialsFromName(name) {
  return String(name || 'New User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'NU';
}

function inferRoleFromEmail(email = '') {
  const normalized = email.trim().toLowerCase();
  if (normalized.includes('@ventas')) {
    return {
      roleKey: 'commercial',
      scope: 'ops',
      segment: 'S1',
      roleName: 'S1 Commercial Ops',
      accessLevel: 'Commercial operator',
      department: 'Sales',
    };
  }
  if (normalized.includes('@logistica') || normalized.includes('@logistics')) {
    return {
      roleKey: 'logistics',
      scope: 'ops',
      segment: 'S2',
      roleName: 'S2 Logistics Ops',
      accessLevel: 'Company owner',
      department: 'Logistics',
    };
  }
  if (normalized.includes('@buyer') || normalized.includes('@compras')) {
    return {
      roleKey: 'buyer',
      scope: 'portal',
      segment: 'S3',
      roleName: 'S3 Portal Buyer',
      accessLevel: 'Buyer portal access',
      department: 'Buyer Portal',
    };
  }
  return {
    roleKey: 'buyer',
    scope: 'portal',
    segment: 'S3',
    roleName: 'S3 Portal Buyer',
    accessLevel: 'Buyer portal access',
    department: 'Buyer Portal',
  };
}

function createUser() {
  if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
    toast.add({ severity: 'warn', summary: 'Missing user data', detail: 'Name and email are required.', life: 3000 });
    return;
  }
  const role = inferRoleFromEmail(newUserForm.email);
  const clientId = role.scope === 'portal'
    ? (newUserForm.clientId || buyerClients.value[0]?.id || null)
    : null;
  const user = ds.addUser({
    name: newUserForm.name.trim(),
    email: newUserForm.email.trim(),
    initials: initialsFromName(newUserForm.name),
    role: role.roleName,
    roleKey: role.roleKey,
    scope: role.scope,
    segment: role.segment,
    department: role.department,
    clientId,
    preferredLanguage: 'en',
  });
  teamOverrides[user.id] = {
    status: 'active',
    accessLevel: role.accessLevel,
    lastActivity: 'Created locally',
  };
  newUserForm.name = '';
  newUserForm.email = '';
  newUserForm.clientId = '';
  saveLocal(false);
  toast.add({ severity: 'success', summary: 'User created', detail: `${user.email} - initial password demo1234`, life: 3800 });
}

function gateLabel(value) {
  if (value === true) return 'Enabled';
  if (value === false || value == null) return 'Disabled';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function gateClass(value) {
  if (value === true) return 'badge-green';
  if (value === false || value == null) return 'badge-gray';
  return 'badge-blue';
}

function changeLogo(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  logoPreview.value = URL.createObjectURL(file);
}

function toggleStatus(user) {
  const current = teamOverrides[user.id]?.status || user.status || 'active';
  teamOverrides[user.id] = {
    ...(teamOverrides[user.id] || {}),
    status: current === 'active' ? 'inactive' : 'active',
    accessLevel: user.accessLevel,
    lastActivity: 'Updated locally',
  };
  saveLocal(false);
}

function updateAccess(user, accessLevel) {
  teamOverrides[user.id] = {
    ...(teamOverrides[user.id] || {}),
    status: user.status,
    accessLevel,
    lastActivity: 'Updated locally',
  };
  saveLocal(false);
}

function saveLocal(showToast = true) {
  localStorage.setItem(localKey, JSON.stringify({
    ...form,
    logoPreview: logoPreview.value,
    teamOverrides: { ...teamOverrides },
    newUserName: newUserForm.name,
    newUserEmail: newUserForm.email,
    newUserClientId: newUserForm.clientId,
  }));
  if (showToast) {
    toast.add({ severity: 'success', summary: 'Company settings saved', detail: 'Demo changes were stored locally.', life: 2800 });
  }
}
</script>

<template>
  <div class="company-admin-page">
    <div class="page-header">
      <div>
        <div class="page-title">Company Administration</div>
        <div class="page-subtitle">S2-owned company settings, team access, subscription visibility and feature gates for the local demo.</div>
      </div>
      <button class="btn btn-primary" @click="saveLocal()"><i class="pi pi-check"></i> Save changes</button>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>Simulated company administration. Changes are stored locally in this browser; no production backend, billing or user-management service is connected.</div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Company Identity</div>
            <div class="flow-subtitle">Legal identity is read-only; operational contact fields are editable for the demo.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="company-logo-editor">
            <div class="company-logo-preview">
              <img v-if="logoPreview" :src="logoPreview" alt="Company logo preview" />
              <span v-else>IC</span>
            </div>
            <label class="btn btn-secondary">
              <i class="pi pi-camera"></i> Change logo
              <input type="file" accept="image/*" class="sr-only" @change="changeLogo" />
            </label>
          </div>
          <label class="field">
            <span class="field-label">Legal name</span>
            <input class="plain-input" :value="company.legalName" disabled />
          </label>
          <div class="form-grid">
            <label class="field">
              <span class="field-label">Commercial name</span>
              <input class="plain-input" v-model="form.commercialName" />
            </label>
            <label class="field">
              <span class="field-label">RUC</span>
              <input class="plain-input" :value="company.ruc" disabled />
            </label>
          </div>
          <label class="field">
            <span class="field-label">Industry</span>
            <input class="plain-input" value="Cold-chain distribution / Importer-distributor" disabled />
          </label>
          <label class="field">
            <span class="field-label">Main location</span>
            <input class="plain-input" v-model="form.mainLocation" />
          </label>
          <div class="form-grid">
            <label class="field">
              <span class="field-label">Contact email</span>
              <input class="plain-input" v-model="form.contactEmail" />
            </label>
            <label class="field">
              <span class="field-label">Phone</span>
              <input class="plain-input" v-model="form.phone" />
            </label>
          </div>
          <label class="field">
            <span class="field-label">Operating zones</span>
            <textarea class="plain-textarea" v-model="form.operatingZones"></textarea>
          </label>
          <label class="field">
            <span class="field-label">Cold-chain specialization</span>
            <textarea class="plain-textarea" v-model="form.specialization"></textarea>
          </label>
        </div>
      </section>

      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Team Access</div>
            <div class="flow-subtitle">Creates local Mock API user records for role simulation. Initial password is demo1234.</div>
          </div>
          <button class="btn btn-secondary" @click="createUser"><i class="pi pi-user-plus"></i> Create user</button>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="iam-create-card">
            <div class="form-grid">
              <label class="field">
                <span class="field-label">Full name</span>
                <input class="plain-input" v-model="newUserForm.name" placeholder="New team member" />
              </label>
              <label class="field">
                <span class="field-label">Email</span>
                <input class="plain-input" v-model="newUserForm.email" placeholder="user@ventas.nexa" />
              </label>
              <label class="field">
                <span class="field-label">Buyer client</span>
                <select class="plain-select" v-model="newUserForm.clientId" :disabled="inferredRole.scope !== 'portal'">
                  <option value="">Use first buyer client</option>
                  <option v-for="client in buyerClients" :key="client.id" :value="client.id">
                    {{ client.businessName || client.name }}
                  </option>
                </select>
              </label>
              <div class="iam-role-preview" aria-live="polite">
                <span class="flow-eyebrow">Inferred role</span>
                <strong>{{ inferredRole.roleName }}</strong>
                <span>{{ inferredRole.segment }} - {{ inferredRole.scope === 'portal' ? 'Buyer Portal' : 'Operations Workspace' }}</span>
              </div>
            </div>
            <div class="flow-note" style="margin-top:10px">
              Email hints: @ventas creates S1 commercial ops, @logistica creates S2 logistics ops, and @buyer creates S3 buyer access.
            </div>
          </div>
          <div class="team-access-list">
            <article v-for="member in teamMembers" :key="member.id" class="team-access-card">
              <div class="avatar">{{ member.initials }}</div>
              <div class="team-access-main">
                <strong>{{ member.name }}</strong>
                <span>{{ segmentLabel(member) }}</span>
                <small>{{ member.email }}</small>
              </div>
              <label class="field team-access-select">
                <span class="field-label">Access level</span>
                <select class="plain-select" :value="member.accessLevel" @change="updateAccess(member, $event.target.value)">
                  <option>Company owner</option>
                  <option>Commercial operator</option>
                  <option>Buyer portal access</option>
                  <option>Read-only access</option>
                </select>
              </label>
              <div class="team-access-status">
                <span :class="'badge ' + (member.status === 'active' ? 'badge-green' : 'badge-gray')">{{ member.status === 'active' ? 'Active' : 'Inactive' }}</span>
                <small>{{ member.lastActivity }}</small>
              </div>
              <button class="btn btn-ghost btn-sm" @click="toggleStatus(member)">{{ member.status === 'active' ? 'Disable' : 'Enable' }}</button>
            </article>
          </div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Subscription Overview</div>
            <div class="flow-subtitle">Review the current service plan and request changes through commercial operations.</div>
          </div>
          <button class="btn btn-secondary"><i class="pi pi-send"></i> Request plan change</button>
        </div>
        <div class="flow-panel-pad">
          <div class="subscription-grid">
            <article v-for="plan in plans" :key="plan.key" class="subscription-card" :class="{ active: currentPlan === plan.key }">
              <div class="flow-row-between" style="margin-bottom:10px">
                <h2>{{ plan.title }}</h2>
                <span v-if="currentPlan === plan.key" class="badge badge-blue">Current plan</span>
                <span v-else class="demo-label">Available</span>
              </div>
              <p>{{ plan.summary }}</p>
              <ul>
                <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Company Feature Gates</div>
            <div class="flow-subtitle">Plan-based module visibility for the current tenant.</div>
          </div>
          <span class="demo-label">Simulated feature gates</span>
        </div>
        <div class="flow-panel-pad feature-gate-grid">
          <div v-for="[label, value] in featureGates" :key="label" class="feature-gate-card">
            <span>{{ label }}</span>
            <span :class="'badge ' + gateClass(value)">{{ gateLabel(value) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
