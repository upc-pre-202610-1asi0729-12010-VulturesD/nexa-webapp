<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';

const router = useRouter();
const toast = useToast();
const cart = useCartStore();
const auth = useAuthStore();
const ds = useDataStore();

const requestedDeliveryDate = ref('2026-05-23');
const deliveryAddressId = ref('');
const comments = ref('');
const submittedRequestId = ref('');

const client = computed(() => ds.clientById(auth.user?.clientId));
const addresses = computed(() => ds.D.deliveryAddresses.filter(address => address.clientId === auth.user?.clientId));
const totalWeight = computed(() => cart.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(ds.productById(item.productId)?.weightKg || 1), 0));

function submitRequest() {
  if (!client.value || !cart.items.length) {
    toast.add({ severity: 'warn', summary: 'Incomplete request', detail: 'Add products before submitting.', life: 3000 });
    return;
  }
  const request = ds.addPurchaseRequest({
    clientId: client.value.id,
    buyerUserId: auth.user?.id,
    deliveryAddressId: deliveryAddressId.value || addresses.value[0]?.id || null,
    requestedDeliveryDate: requestedDeliveryDate.value,
    comments: comments.value,
    items: cart.items.map(item => ({
      productId: item.productId,
      qty: item.qty,
      unit: item.unit,
      estimatedWeightKg: Number(item.qty || 0) * Number(ds.productById(item.productId)?.weightKg || 1),
      notes: item.notes || '',
    })),
  });
  submittedRequestId.value = request.id;
  cart.clear();
  toast.add({ severity: 'success', summary: 'Request submitted', detail: request.id, life: 3500 });
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Request Builder</div>
      <div class="page-subtitle">Create a purchase request. S1 must validate it before a purchase order is confirmed.</div>
    </div>
    <span class="demo-label">Not a final order</span>
  </div>

  <div v-if="submittedRequestId" class="flow-panel" style="max-width:680px;margin:0 auto">
    <div class="flow-panel-pad" style="text-align:center">
      <div style="width:72px;height:72px;border-radius:50%;background:#DCFCE7;color:#15803D;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">
        <i class="pi pi-check" style="font-size:34px"></i>
      </div>
      <div class="buyer-title" style="color:#0F172A">Your request was submitted</div>
      <div class="flow-note" style="margin:10px auto 22px;max-width:520px">
        The commercial team will review it before confirming the purchase order. You can follow the status in My Requests.
      </div>
      <div class="mono" style="font-size:20px;font-weight:800;color:#1D4ED8;margin-bottom:22px">{{ submittedRequestId }}</div>
      <div class="flow-row" style="justify-content:center">
        <button class="btn btn-ghost" @click="router.push('/portal/product-catalog')">Back to Catalog</button>
        <button class="btn btn-primary" @click="router.push('/portal/purchase-requests/' + submittedRequestId)">View Request</button>
      </div>
    </div>
  </div>

  <div v-else class="flow-grid-12">
    <section class="flow-panel span-8">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Selected Products</div>
          <div class="flow-subtitle">{{ cart.count }} units - {{ totalWeight }} estimated kg</div>
        </div>
        <button class="btn btn-secondary btn-sm" @click="router.push('/portal/product-catalog')"><i class="pi pi-plus"></i> Add Products</button>
      </div>
      <div class="flow-panel-pad">
        <div v-if="!cart.items.length" class="empty-state" style="padding:36px">
          <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
          <div class="empty-state-title">Your request builder is empty</div>
          <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">Open Catalog</button>
        </div>
        <div v-for="item in cart.items" :key="item.productId" class="flow-list-item">
          <div>
            <div style="font-weight:800">{{ item.name }}</div>
            <div class="flow-note">{{ item.sku }} - {{ ds.productById(item.productId)?.temperatureRange }}</div>
          </div>
          <div class="flow-row">
            <button class="btn btn-ghost btn-sm" @click="cart.setQty(item.productId, item.qty - 1)">-</button>
            <strong>{{ item.qty }} {{ item.unit }}</strong>
            <button class="btn btn-ghost btn-sm" @click="cart.setQty(item.productId, item.qty + 1)">+</button>
            <button class="btn btn-danger btn-sm" @click="cart.remove(item.productId)"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      </div>
    </section>

    <section class="flow-panel span-4">
      <div class="flow-panel-head"><div class="flow-title">Delivery Details</div></div>
      <div class="flow-panel-pad flow-stack">
        <label class="field">
          <span class="field-label">Client</span>
          <input class="plain-input" :value="client?.businessName || client?.name || ''" disabled />
        </label>
        <label class="field">
          <span class="field-label">Delivery Address</span>
          <select v-model="deliveryAddressId" class="plain-select">
            <option value="">Use primary address</option>
            <option v-for="address in addresses" :key="address.id" :value="address.id">{{ address.label }} - {{ address.window }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Requested Date</span>
          <input v-model="requestedDeliveryDate" class="plain-input" type="date" />
        </label>
        <label class="field">
          <span class="field-label">Comments for S1</span>
          <textarea v-model="comments" class="plain-textarea" placeholder="Delivery notes, priority or commercial adjustment..."></textarea>
        </label>
        <div class="banner banner-info" style="margin-bottom:0">
          <i class="pi pi-info-circle"></i>
          <div>Requests are subject to commercial validation. This is not a final purchase or a confirmed purchase order.</div>
        </div>
        <button class="btn btn-primary request-submit-sticky" style="justify-content:center" :disabled="!cart.items.length" @click="submitRequest">
          <i class="pi pi-send"></i> Submit Request
        </button>
      </div>
    </section>
  </div>
</template>
