<script setup>
import { computed, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/iam/application/iam.store';

const toast = useToast();
const auth = useAuthStore();

const storageKey = `nexa.paymentMethods.${auth.user?.id || 'buyer'}`;
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
const methods = ref(saved.methods || [
  { id: 'card-visa-9904', type: 'card', brand: 'Visa', last4: '9904', name: auth.user?.name || 'Buyer', label: 'Primary purchasing card', isDefault: true },
  { id: 'wallet-apple', type: 'wallet', brand: 'Apple Pay', label: 'Apple Pay wallet', isDefault: false },
  { id: 'wallet-google', type: 'wallet', brand: 'Google Pay', label: 'Google Pay wallet', isDefault: false },
]);
const selectedMethodId = ref(saved.selectedMethodId || methods.value.find(method => method.isDefault)?.id || methods.value[0]?.id);
const selectedWallet = ref('Apple Pay');

const cardForm = reactive({
  number: '',
  name: saved.name || auth.user?.name || '',
  label: saved.label || 'Purchasing team reference',
});

const detectedBrand = computed(() => detectCardBrand(cardForm.number));
const sanitizedNumber = computed(() => cardForm.number.replace(/\D/g, ''));
const canSaveCard = computed(() => sanitizedNumber.value.length >= 12 && cardForm.name.trim());

function detectCardBrand(value = '') {
  const number = value.replace(/\D/g, '');
  if (/^4/.test(number)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
  if (/^3(0[0-5]|[68])/.test(number)) return 'Diners Club';
  if (/^3[47]/.test(number)) return 'American Express';
  return 'Card';
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify({
    methods: methods.value,
    selectedMethodId: selectedMethodId.value,
    name: cardForm.name,
    label: cardForm.label,
  }));
}

function saveCard() {
  if (!canSaveCard.value) {
    toast.add({ severity: 'warn', summary: 'Card incomplete', detail: 'Enter a valid card number and cardholder name.', life: 3000 });
    return;
  }
  const last4 = sanitizedNumber.value.slice(-4);
  const method = {
    id: `card-${Date.now()}`,
    type: 'card',
    brand: detectedBrand.value,
    last4,
    name: cardForm.name.trim(),
    label: cardForm.label.trim() || `${detectedBrand.value} card`,
    isDefault: !methods.value.length,
  };
  methods.value.unshift(method);
  selectedMethodId.value = method.id;
  cardForm.number = '';
  persist();
  toast.add({ severity: 'success', summary: 'Payment method saved', detail: `${method.brand} ending in ${last4}`, life: 3200 });
}

function addWallet() {
  const existing = methods.value.find(method => method.brand === selectedWallet.value);
  if (existing) {
    selectedMethodId.value = existing.id;
    persist();
    return;
  }
  const method = {
    id: `wallet-${selectedWallet.value.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'wallet',
    brand: selectedWallet.value,
    label: `${selectedWallet.value} wallet`,
    isDefault: !methods.value.length,
  };
  methods.value.unshift(method);
  selectedMethodId.value = method.id;
  persist();
  toast.add({ severity: 'success', summary: 'Wallet added', detail: selectedWallet.value, life: 2800 });
}

function makeDefault(method) {
  methods.value = methods.value.map(item => ({ ...item, isDefault: item.id === method.id }));
  selectedMethodId.value = method.id;
  persist();
}

function removeMethod(method) {
  methods.value = methods.value.filter(item => item.id !== method.id);
  if (selectedMethodId.value === method.id) selectedMethodId.value = methods.value[0]?.id || '';
  persist();
}
</script>

<template>
  <div class="payment-page">
    <div class="page-header">
      <div>
        <div class="page-title">Payment Methods</div>
        <div class="page-subtitle">Manage card and wallet references for the S3 checkout preview. No real payment processing is enabled.</div>
      </div>
      <span class="demo-label">Local preview</span>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>Do not enter real card credentials. This screen stores only local preview metadata: brand, last four digits, name and label.</div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Add Card</div>
            <div class="flow-subtitle">Brand detection supports Visa, Mastercard, Diners Club and common fallback cards.</div>
          </div>
          <span class="payment-brand-pill">{{ detectedBrand }}</span>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div :class="'visual-card brand-' + detectedBrand.toLowerCase().replace(/\s+/g, '-')">
            <div class="visual-card-chip"></div>
            <div class="visual-card-brand">{{ detectedBrand }}</div>
            <div class="visual-card-number">{{ sanitizedNumber ? '•••• •••• •••• ' + sanitizedNumber.slice(-4).padStart(4, '•') : '•••• •••• •••• ••••' }}</div>
            <div class="visual-card-foot">
              <span>{{ cardForm.name || 'Cardholder name' }}</span>
              <span>{{ cardForm.label || 'Billing label' }}</span>
            </div>
          </div>

          <div class="form-grid">
            <label class="field span-full">
              <span class="field-label">Card number</span>
              <input class="plain-input" v-model="cardForm.number" inputmode="numeric" autocomplete="off" placeholder="4111 1111 1111 1111" />
            </label>
            <label class="field">
              <span class="field-label">Cardholder name</span>
              <input class="plain-input" v-model="cardForm.name" placeholder="Elena Litano" />
            </label>
            <label class="field">
              <span class="field-label">Billing label</span>
              <input class="plain-input" v-model="cardForm.label" placeholder="Purchasing team reference" />
            </label>
          </div>
          <button class="btn btn-primary" :disabled="!canSaveCard" @click="saveCard"><i class="pi pi-plus"></i> Save card reference</button>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Wallets</div>
            <div class="flow-subtitle">Add buyer-facing wallet options for checkout UI validation.</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="wallet-selector">
            <button :class="{ active: selectedWallet === 'Apple Pay' }" @click="selectedWallet = 'Apple Pay'">
              <i class="pi pi-apple"></i>
              <span>Apple Pay</span>
            </button>
            <button :class="{ active: selectedWallet === 'Google Pay' }" @click="selectedWallet = 'Google Pay'">
              <i class="pi pi-google"></i>
              <span>Google Pay</span>
            </button>
          </div>
          <button class="btn btn-secondary" @click="addWallet"><i class="pi pi-wallet"></i> Add wallet option</button>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Saved Payment References</div>
            <div class="flow-subtitle">Only local metadata is displayed here.</div>
          </div>
        </div>
        <div class="flow-panel-pad payment-method-grid">
          <article
            v-for="method in methods"
            :key="method.id"
            class="payment-method-card"
            :class="{ active: selectedMethodId === method.id }"
            @click="selectedMethodId = method.id; persist()"
          >
            <div class="payment-card-top">
              <i :class="'pi ' + (method.type === 'wallet' ? (method.brand === 'Apple Pay' ? 'pi-apple' : 'pi-google') : 'pi-credit-card')" aria-hidden="true"></i>
              <span v-if="method.isDefault" class="flow-pill flow-pill-blue">Default</span>
            </div>
            <strong>{{ method.brand }}</strong>
            <span>{{ method.type === 'card' ? `${method.label} ending in ${method.last4}` : method.label }}</span>
            <div class="flow-row" style="margin-top:auto;flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" @click.stop="makeDefault(method)">Make default</button>
              <button class="btn btn-ghost btn-sm" @click.stop="removeMethod(method)">Delete</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
