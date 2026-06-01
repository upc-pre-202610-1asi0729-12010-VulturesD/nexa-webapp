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

const client = computed(() => ds.clientById(auth.user?.clientId) || {});
const savedProfile = JSON.parse(localStorage.getItem(`nexa.buyerProfile.${auth.user?.id}`) || '{}');
const avatarPreview = ref(savedProfile.avatarPreview || '');
const paymentStorage = computed(() => JSON.parse(localStorage.getItem(`nexa.paymentMethods.${auth.user?.id || 'buyer'}`) || '{}'));
const paymentMethodsCount = computed(() => paymentStorage.value.methods?.length || 0);
const defaultPayment = computed(() => paymentStorage.value.methods?.find(method => method.isDefault) || paymentStorage.value.methods?.[0]);

const form = reactive({
  fullName: savedProfile.fullName || auth.user?.name || '',
  email: savedProfile.email || auth.user?.email || '',
  phone: savedProfile.phone || auth.user?.phone || client.value.phone || '',
  buyerType: savedProfile.buyerType || client.value.buyerType || 'company',
  ruc: savedProfile.ruc || client.value.ruc || '',
  companyName: savedProfile.companyName || client.value.businessName || client.value.name || '',
  contactPerson: savedProfile.contactPerson || client.value.contact || auth.user?.name || '',
  storeName: savedProfile.storeName || client.value.storeName || client.value.commercialName || '',
  deliveryAddress: savedProfile.deliveryAddress || client.value.deliveryAddress || client.value.address || '',
  district: savedProfile.district || client.value.district || 'Lima',
  referenceNotes: savedProfile.referenceNotes || client.value.referenceNotes || 'Use supplier reception desk for chilled products.',
  preferredDeliveryWindow: savedProfile.preferredDeliveryWindow || client.value.preferredDeliveryWindow || '8:00 a.m. - 1:00 p.m.',
  coldChainReceivingNotes: savedProfile.coldChainReceivingNotes || client.value.coldChainReceivingNotes || 'Receiving dock available from 8:00 a.m. to 1:00 p.m.',
  preferredLanguage: savedProfile.preferredLanguage || auth.user?.preferredLanguage || 'en',
  catalogView: savedProfile.catalogView || 'grid',
  communicationChannel: savedProfile.communicationChannel || 'portal',
});

const notifications = reactive({
  requestUpdates: savedProfile.notifications?.requestUpdates ?? true,
  orderUpdates: savedProfile.notifications?.orderUpdates ?? true,
  dispatchTracking: savedProfile.notifications?.dispatchTracking ?? true,
  documentUpdates: savedProfile.notifications?.documentUpdates ?? true,
  promotionAlerts: savedProfile.notifications?.promotionAlerts ?? true,
  temperatureAlerts: savedProfile.notifications?.temperatureAlerts ?? false,
});

const planLabel = computed(() => auth.user?.planAccess || ds.D.company.subscriptionPlan || 'standard');
const initials = computed(() => auth.user?.initials || form.fullName.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'BP');

function changePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  avatarPreview.value = URL.createObjectURL(file);
}

function saveProfile() {
  localStorage.setItem(`nexa.buyerProfile.${auth.user?.id}`, JSON.stringify({
    ...form,
    avatarPreview: avatarPreview.value,
    notifications: { ...notifications },
  }));
  toast.add({ severity: 'success', summary: 'Buyer profile saved', detail: 'Demo profile changes were stored locally.', life: 3000 });
}

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
        <p>Manage buyer identity, delivery preferences, notifications and payment references.</p>
      </div>
    </section>

    <section class="profile-hero buyer-profile-hero">
      <div class="profile-avatar-xl">
        <img v-if="avatarPreview" :src="avatarPreview" alt="Buyer avatar preview" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="profile-hero-copy">
        <div class="demo-label">{{ planLabel }} plan</div>
        <h1>{{ form.fullName }}</h1>
        <p>{{ form.companyName }} · {{ form.buyerType === 'company' ? 'Company buyer' : 'Individual buyer' }} · Active demo account</p>
      </div>
      <div class="profile-hero-actions">
        <label class="btn btn-secondary">
          <i class="pi pi-camera"></i> Change photo
          <input type="file" accept="image/*" class="sr-only" @change="changePhoto" />
        </label>
        <button class="btn btn-primary" @click="saveProfile"><i class="pi pi-check"></i> Save changes</button>
        <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
        <button class="btn btn-ghost" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
      </div>
    </section>

    <div class="profile-grid">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Buyer Identity</div>
            <div class="flow-subtitle">Enter your RUC if you represent a company, or your full name if you are buying as an individual.</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Full name</span><input class="plain-input" v-model="form.fullName" /></label>
          <label class="field"><span class="field-label">Email</span><input class="plain-input" v-model="form.email" disabled /></label>
          <label class="field"><span class="field-label">Phone</span><input class="plain-input" v-model="form.phone" /></label>
          <label class="field"><span class="field-label">Buyer type</span><select class="plain-select" v-model="form.buyerType"><option value="company">Company buyer</option><option value="individual">Individual buyer</option></select></label>
          <label class="field"><span class="field-label">RUC / Tax ID</span><input class="plain-input" v-model="form.ruc" /></label>
          <label class="field"><span class="field-label">Company name</span><input class="plain-input" v-model="form.companyName" /></label>
          <label class="field span-full"><span class="field-label">Contact person</span><input class="plain-input" v-model="form.contactPerson" /></label>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head"><div><div class="flow-title">Notification Preferences</div><div class="flow-subtitle">Control buyer-facing updates.</div></div></div>
        <div class="flow-panel-pad toggle-list">
          <label v-for="(value, key) in notifications" :key="key" class="toggle-row">
            <span>{{ {
              requestUpdates: 'Purchase request updates',
              orderUpdates: 'Purchase order updates',
              dispatchTracking: 'Dispatch tracking updates',
              documentUpdates: 'Business document updates',
              promotionAlerts: 'Promotion alerts',
              temperatureAlerts: 'Temperature/cold-chain alerts (Premium preview)',
            }[key] }}</span>
            <input type="checkbox" v-model="notifications[key]" />
          </label>
        </div>
      </section>

      <section class="flow-panel span-7">
        <div class="flow-panel-head"><div><div class="flow-title">Store / Delivery Profile</div><div class="flow-subtitle">Used for request review and dispatch coordination.</div></div></div>
        <div class="flow-panel-pad form-grid">
          <label class="field"><span class="field-label">Store name</span><input class="plain-input" v-model="form.storeName" /></label>
          <label class="field"><span class="field-label">District / city</span><input class="plain-input" v-model="form.district" /></label>
          <label class="field span-full"><span class="field-label">Delivery address</span><input class="plain-input" v-model="form.deliveryAddress" /></label>
          <label class="field"><span class="field-label">Preferred delivery window</span><input class="plain-input" v-model="form.preferredDeliveryWindow" /></label>
          <label class="field"><span class="field-label">Reference notes</span><input class="plain-input" v-model="form.referenceNotes" /></label>
          <label class="field span-full"><span class="field-label">Cold-chain receiving notes</span><textarea class="plain-textarea" v-model="form.coldChainReceivingNotes"></textarea></label>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head"><div><div class="flow-title">Preferences</div><div class="flow-subtitle">Portal display and communication defaults.</div></div></div>
        <div class="flow-panel-pad flow-stack">
          <label class="field"><span class="field-label">Preferred language</span><select class="plain-select" v-model="form.preferredLanguage"><option value="en">English</option><option value="es">Spanish</option></select></label>
          <label class="field"><span class="field-label">Default catalog view</span><select class="plain-select" v-model="form.catalogView"><option value="grid">Grid</option><option value="compact">Compact</option></select></label>
          <label class="field"><span class="field-label">Preferred communication channel</span><select class="plain-select" v-model="form.communicationChannel"><option value="email">Email</option><option value="portal">Portal messages</option><option value="phone">Phone</option></select></label>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Payment Methods</div>
            <div class="flow-subtitle">Payment references are managed in their own screen for checkout and invoicing preview.</div>
          </div>
        </div>
        <div class="flow-panel-pad payment-summary-panel">
          <div class="flow-kpi-icon"><i class="pi pi-credit-card"></i></div>
          <div>
            <div style="font-weight:800;color:#0F172A">
              {{ paymentMethodsCount ? `${paymentMethodsCount} saved payment reference(s)` : 'No payment references saved yet' }}
            </div>
            <div class="flow-note">
              <template v-if="defaultPayment">
                Default: {{ defaultPayment.brand }} {{ defaultPayment.last4 ? `ending in ${defaultPayment.last4}` : defaultPayment.label }}
              </template>
              <template v-else>
                Add a card or wallet reference before previewing checkout payment selection.
              </template>
            </div>
          </div>
          <button class="btn btn-primary" @click="router.push('/portal/payment-methods')"><i class="pi pi-arrow-right"></i> Manage payments</button>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Account Access</div>
            <div class="flow-subtitle">Demo account actions only. No production authentication service is connected.</div>
          </div>
        </div>
        <div class="flow-panel-pad profile-account-actions">
          <button class="btn btn-secondary" @click="endSession"><i class="pi pi-users"></i> Switch Account</button>
          <button class="btn btn-ghost" @click="endSession"><i class="pi pi-sign-out"></i> Log Out</button>
        </div>
      </section>
    </div>
  </div>
</template>
