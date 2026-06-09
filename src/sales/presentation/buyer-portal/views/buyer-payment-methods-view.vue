<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

const auth = useAuthStore();
const ds = useDataStore();

const clientId = computed(() => auth.user?.clientId || '');
const payments = computed(() => {
  const rows = ds.D.payments || [];
  if (!clientId.value) return rows;
  const scoped = rows.filter(payment => payment.clientId === clientId.value);
  return scoped.length ? scoped : rows;
});
const paymentMethods = computed(() => ds.paymentMethodsForClient(clientId.value));
const totalPaid = computed(() =>
  payments.value
    .filter(payment => String(payment.status).toLowerCase() === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
);
const totalPending = computed(() =>
  payments.value
    .filter(payment => String(payment.status).toLowerCase() !== 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
);
const formatMoney = (value, currency = 'PEN') => `${currency} ${Number(value || 0).toFixed(2)}`;
</script>

<template>
  <div class="payment-page">
    <div class="page-header">
      <div>
        <div class="page-title">Payments</div>
        <div class="page-subtitle">Backend payment records plus optional local payment-method references.</div>
      </div>
    </div>

    <div class="banner banner-info">
      <i class="pi pi-info-circle" aria-hidden="true"></i>
      <div>Payment records come from the operations backend. Saved methods are shown in read-only workspace mode.</div>
    </div>

    <div class="grid-3" style="margin-bottom:18px">
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-check-circle" style="color:#16A34A"></i> Paid</div>
        <div class="kpi-value" style="color:#16A34A">S/ {{ totalPaid.toFixed(2) }}</div>
        <div class="kpi-sub">Confirmed payment records</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B"></i> Pending</div>
        <div class="kpi-value" style="color:#F59E0B">S/ {{ totalPending.toFixed(2) }}</div>
        <div class="kpi-sub">Pending payment records</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-credit-card" style="color:#2563EB"></i> Records</div>
        <div class="kpi-value" style="color:#2563EB">{{ payments.length }}</div>
        <div class="kpi-sub">Backend payment rows</div>
      </div>
    </div>

    <section class="flow-panel">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Payment Records</div>
          <div class="flow-subtitle">Invoice payment references exposed by the invoicing backend.</div>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Invoice</th>
            <th>Order</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td><span class="mono">{{ payment.referenceCode }}</span></td>
            <td><span class="mono">{{ payment.invoiceCode || payment.invoiceId }}</span></td>
            <td><span class="mono">{{ payment.orderId || 'Pending relation' }}</span></td>
            <td style="font-weight:700">{{ formatMoney(payment.amount, payment.currency) }}</td>
            <td>
              <span :class="'badge ' + (String(payment.status).toLowerCase() === 'paid' ? 'badge-green' : 'badge-amber')">
                {{ payment.status }}
              </span>
            </td>
          </tr>
          <tr v-if="!payments.length">
            <td colspan="5">
              <div class="empty-state compact">
                <div class="empty-state-icon"><i class="pi pi-credit-card"></i></div>
                <div class="empty-state-title">No payment records</div>
                <div class="empty-state-desc">No backend payment records are available for this account.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="flow-panel" style="margin-top:18px">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Payment Methods</div>
          <div class="flow-subtitle">Local references used for buyer portal presentation.</div>
        </div>
      </div>
      <div class="flow-panel-pad flow-stack">
        <div v-for="method in paymentMethods" :key="method.id" class="flow-list-item">
          <div>
            <strong>{{ method.label || method.brand }}</strong>
            <div class="flow-note">{{ method.brand }} · {{ method.type }} · **** {{ method.last4 }}</div>
          </div>
          <button class="btn btn-secondary btn-sm" :disabled="method.isDefault" @click="ds.setDefaultPaymentMethod(method.id)">
            {{ method.isDefault ? 'Default' : 'Set default' }}
          </button>
        </div>
        <div v-if="!paymentMethods.length" class="empty-state compact">
          <div class="empty-state-icon"><i class="pi pi-wallet"></i></div>
          <div class="empty-state-title">No local payment methods</div>
          <div class="empty-state-desc">Run npm run server to load optional payment method references.</div>
        </div>
      </div>
    </section>
  </div>
</template>
