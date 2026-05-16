<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, coldTypeLabel, coldTypeBadge } from '@/shared/status';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const ds = useDataStore();
const messageBody = ref('');

const request = computed(() => {
  const found = ds.purchaseRequestById(route.params.id);
  return found?.clientId === auth.user?.clientId ? found : null;
});
const items = computed(() => request.value ? ds.requestItemsFor(request.value.id) : []);
const messages = computed(() => request.value ? ds.messagesForRequest(request.value.id) : []);
const convertedOrder = computed(() => request.value?.convertedOrderId ? ds.purchaseOrderById(request.value.convertedOrderId) : null);

function sendMessage() {
  const body = messageBody.value.trim();
  if (!request.value || !body) return;
  ds.addMessage({
    requestId: request.value.id,
    purchaseRequestId: request.value.id,
    senderRole: 'buyer',
    senderName: auth.user?.name || 'B2B Buyer',
    body,
    visibleToCommercial: true,
    visibleToBuyer: true,
  });
  messageBody.value = '';
  toast.add({ severity: 'success', summary: 'Message sent', detail: 'The commercial team can now see your reply.', life: 3000 });
}
</script>

<template>
  <div v-if="!request" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">Request unavailable</div>
    <button class="btn btn-primary" @click="router.push('/portal/purchase-requests')">My Requests</button>
  </div>

  <template v-else>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <button class="btn btn-ghost btn-sm" @click="router.push('/portal/purchase-requests')"><i class="pi pi-arrow-left"></i> Purchase Requests</button>
      <div>
        <div class="flow-row">
          <span class="page-title mono">{{ request.id }}</span>
          <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
        </div>
        <div class="page-subtitle">Requested delivery {{ request.requestedDeliveryDate }}</div>
      </div>
    </div>

    <div v-if="convertedOrder" class="banner banner-success">
      <i class="pi pi-check-circle"></i>
      <div>This request has already been converted into purchase order <strong>{{ convertedOrder.id }}</strong>.</div>
      <button class="btn btn-success btn-sm" @click="router.push('/portal/purchase-orders/' + convertedOrder.id)">View Tracking</button>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-7">
        <div class="flow-panel-head"><div class="flow-title">Requested Products</div></div>
        <table class="data-table">
          <thead><tr><th>Product</th><th>Cold Chain</th><th>Quantity</th><th>Notes</th></tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div style="font-weight:800">{{ ds.productName(item.productId) }}</div>
                <div class="flow-note">{{ ds.productById(item.productId)?.sku }}</div>
              </td>
              <td><span :class="coldTypeBadge(ds.productById(item.productId)?.coldType)">{{ coldTypeLabel(ds.productById(item.productId)?.coldType) }}</span></td>
              <td>{{ item.quantity }} {{ item.unit }} - {{ item.estimatedWeightKg }} kg</td>
              <td>{{ item.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head"><div class="flow-title">Commercial Conversation</div></div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="message in messages" :key="message.id" class="flow-list-item">
            <div>
              <div class="flow-row">
                <strong>{{ message.senderName }}</strong>
                <span class="flow-pill">{{ message.senderRole }}</span>
              </div>
              <div class="flow-note">{{ message.body }}</div>
            </div>
          </div>
          <div v-if="!messages.length" class="flow-note">No comments yet. The commercial team will reply here if adjustments are needed.</div>
          <label class="field">
            <span class="field-label">Reply to Commercial</span>
            <textarea
              v-model="messageBody"
              class="plain-textarea"
              placeholder="Write a clarification, delivery note or adjustment request..."
            ></textarea>
          </label>
          <button class="btn btn-primary" :disabled="!messageBody.trim()" @click="sendMessage">
            <i class="pi pi-send"></i> Send Message
          </button>
        </div>
      </section>
    </div>
  </template>
</template>
