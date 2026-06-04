<script setup>
import { computed, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { creditSummary } from '@/shared/credit';

const toast = useToast();
const auth = useAuthStore();
const ds = useDataStore();

const storageKey = `nexa.paymentMethods.${auth.user?.id || 'buyer'}`;
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
const localMethods = ref(saved.methods || []);
const selectedWallet = ref('Apple Pay');
const client = computed(() => ds.clientById(auth.user?.clientId) || {});
const credit = computed(() => creditSummary(client.value));
const apiMethods = computed(() => client.value?.id ? ds.paymentMethodsForClient(client.value.id) : []);
const methods = computed(() => apiMethods.value.length ? apiMethods.value : localMethods.value);
const selectedMethodId = ref(saved.selectedMethodId || methods.value.find(method => method.isDefault)?.id || methods.value[0]?.id);
const defaultMethod = computed(() => methods.value.find(method => method.isDefault) || methods.value[0]);
const paymentAmount = ref(Number(saved.paymentAmount || credit.value.due || 0));
const creditRequest = reactive({
  requestedAmount: Number(saved.requestedAmount || Math.max(credit.value.limit + 30000, 30000)),
  reason: saved.reason || 'Seasonal demand requires a higher monthly purchasing line.',
});

const cardForm = reactive({
  number: '',
  name: saved.name || auth.user?.name || '',
  label: saved.label || 'Purchasing team reference',
});

const detectedBrand = computed(() => detectCardBrand(cardForm.number));
const sanitizedNumber = computed(() => cardForm.number.replace(/\D/g, ''));
const canSaveCard = computed(() => Boolean(client.value?.id) && sanitizedNumber.value.length >= 12 && cardForm.name.trim());
const walletOptions = [
  { brand: 'Apple Pay', icon: 'pi-apple', mark: '' },
  { brand: 'Google Pay', icon: 'pi-google', mark: '' },
  { brand: 'Yape', icon: '', mark: 'Y' },
  { brand: 'Plin', icon: '', mark: 'P' },
];

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
    paymentAmount: paymentAmount.value,
    requestedAmount: creditRequest.requestedAmount,
    reason: creditRequest.reason,
  }));
}

function saveCard() {
  if (!canSaveCard.value) {
    toast.add({ severity: 'warn', summary: 'Card incomplete', detail: 'Enter a valid card number and cardholder name.', life: 3000 });
    return;
  }
  const last4 = sanitizedNumber.value.slice(-4);
  const payload = {
    clientId: client.value.id,
    type: 'card',
    brand: detectedBrand.value,
    last4,
    holderName: cardForm.name.trim(),
    label: cardForm.label.trim() || `${detectedBrand.value} card`,
    isDefault: !methods.value.length,
  };
  const method = ds.addPaymentMethod(payload);
  localMethods.value.unshift(method);
  selectedMethodId.value = method.id;
  cardForm.number = '';
  persist();
  toast.add({ severity: 'success', summary: 'Payment method saved', detail: `${method.brand} ending in ${last4}`, life: 3200 });
}

function addWallet() {
  if (!client.value?.id) return;
  const existing = methods.value.find(method => method.brand === selectedWallet.value);
  if (existing) {
    selectedMethodId.value = existing.id;
    persist();
    return;
  }
  const payload = {
    clientId: client.value.id,
    type: 'wallet',
    brand: selectedWallet.value,
    label: `${selectedWallet.value} wallet`,
    walletType: selectedWallet.value,
    isDefault: !methods.value.length,
  };
  const method = ds.addPaymentMethod(payload);
  localMethods.value.unshift(method);
  selectedMethodId.value = method.id;
  persist();
  toast.add({ severity: 'success', summary: 'Wallet added', detail: selectedWallet.value, life: 2800 });
}

function makeDefault(method) {
  ds.setDefaultPaymentMethod(method.id);
  localMethods.value = localMethods.value.map(item => ({ ...item, isDefault: item.id === method.id }));
  selectedMethodId.value = method.id;
  persist();
}

function removeMethod(method) {
  ds.removePaymentMethod(method.id);
  localMethods.value = localMethods.value.filter(item => item.id !== method.id);
  if (selectedMethodId.value === method.id) selectedMethodId.value = methods.value[0]?.id || '';
  persist();
}

function requestCreditIncrease() {
  if (!client.value?.id || !creditRequest.requestedAmount) return;
  const request = ds.addCreditRequest({
    clientId: client.value.id,
    requestedAmount: creditRequest.requestedAmount,
    reason: creditRequest.reason,
    createdByUserId: auth.user?.id,
  });
  persist();
  toast.add({ severity: 'success', summary: 'Credit request sent', detail: `${request.id} assigned to Sales`, life: 3200 });
}

function scheduleCreditPayment() {
  if (!client.value?.id || !paymentAmount.value) return;
  const payment = ds.addCreditPayment({
    clientId: client.value.id,
    amount: paymentAmount.value,
    period: credit.value.period,
    methodId: selectedMethodId.value || defaultMethod.value?.id,
  });
  persist();
  toast.add({ severity: 'success', summary: 'Monthly payment scheduled', detail: `${payment.id} for S/ ${payment.amount.toLocaleString()}`, life: 3200 });
}

function methodIcon(method) {
  if (method.type !== 'wallet') return 'pi-credit-card';
  if (method.brand === 'Apple Pay') return 'pi-apple';
  if (method.brand === 'Google Pay') return 'pi-google';
  return 'pi-wallet';
}
</script>

<template>
  <div class="payment-page">
    <div class="page-header">
      <div>
        <div class="page-title">Payment Methods</div>
        <div class="page-subtitle">Manage card, wallet and monthly credit references for checkout and invoicing coordination.</div>
      </div>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>For card references, Nexa stores only the card brand, last four digits, cardholder name and billing label.</div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Monthly Credit</div>
            <div class="flow-subtitle">Credit line used by Sales and Logistics to coordinate commercial approval and dispatch risk.</div>
          </div>
          <span :class="'badge ' + credit.badgeClass">{{ credit.statusLabel }}</span>
        </div>
        <div class="flow-panel-pad credit-payment-grid">
          <div class="credit-summary-box">
            <div class="mini-row"><span class="meta-label">Available</span><strong>S/ {{ credit.available.toLocaleString() }}</strong></div>
            <div class="mini-row"><span class="meta-label">Used</span><span>S/ {{ credit.used.toLocaleString() }} of S/ {{ credit.limit.toLocaleString() }}</span></div>
            <div class="credit-bar-wrap"><div class="credit-bar" :style="{ width: credit.percent + '%', background: credit.barColor }"></div></div>
            <div class="flow-note">Period {{ credit.period }} · Due {{ credit.dueDate }} · Monthly quota S/ {{ credit.due.toLocaleString() }}</div>
          </div>
          <div class="flow-stack">
            <label class="field">
              <span class="field-label">Monthly payment amount</span>
              <input class="plain-input" v-model.number="paymentAmount" type="number" min="1" />
            </label>
            <button class="btn btn-primary" :disabled="!paymentAmount" @click="scheduleCreditPayment">
              <i class="pi pi-wallet"></i> Pay monthly quota
            </button>
          </div>
          <div class="flow-stack">
            <label class="field">
              <span class="field-label">Requested credit limit</span>
              <input class="plain-input" v-model.number="creditRequest.requestedAmount" type="number" min="1" />
            </label>
            <label class="field">
              <span class="field-label">Message for Sales</span>
              <input class="plain-input" v-model="creditRequest.reason" />
            </label>
            <button class="btn btn-secondary" :disabled="!creditRequest.requestedAmount" @click="requestCreditIncrease">
              <i class="pi pi-send"></i> Request credit increase
            </button>
          </div>
        </div>
      </section>

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
            <div class="visual-card-number">{{ sanitizedNumber ? sanitizedNumber.slice(-4) : 'Last digits' }}</div>
            <div class="visual-card-foot">
              <span>{{ cardForm.name || 'Cardholder name' }}</span>
              <span>{{ cardForm.label || 'Billing label' }}</span>
            </div>
          </div>

          <div class="accepted-card-strip" aria-label="Supported card brands">
            <span class="card-network card-network-visa">Visa</span>
            <span class="card-network card-network-mastercard">Mastercard</span>
            <span class="card-network card-network-diners">Diners Club</span>
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
            <button v-for="wallet in walletOptions" :key="wallet.brand" :class="{ active: selectedWallet === wallet.brand }" @click="selectedWallet = wallet.brand">
              <i v-if="wallet.icon" :class="'pi ' + wallet.icon"></i>
              <span v-else :class="['wallet-mark', wallet.brand === 'Yape' ? 'wallet-mark-yape' : 'wallet-mark-plin']">{{ wallet.mark }}</span>
              <span>{{ wallet.brand }}</span>
            </button>
          </div>
          <button class="btn btn-secondary" @click="addWallet"><i class="pi pi-wallet"></i> Add wallet option</button>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Saved Payment References</div>
            <div class="flow-subtitle">Only brand and reference metadata is displayed here.</div>
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
              <i :class="'pi ' + methodIcon(method)" aria-hidden="true"></i>
              <span v-if="method.isDefault" class="flow-pill flow-pill-blue">Default</span>
            </div>
            <strong>{{ method.brand }}</strong>
            <span>{{ method.type === 'card' ? `${method.label} · ${method.last4}` : method.label }}</span>
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
