<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { ORDER_STATUS_FLOW, orderStatusLabel, orderStatusBadge, priorityLabel, orderStepState, displayCode, timelineEventForStep, formatTimelineDateTime } from '@/shared/status';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const ds = useDataStore();
const D = ds.D;

const order = computed(() => ds.orderById(route.params.id));
const client = computed(() => order.value ? ds.clientById(order.value.clientId) : null);
const displayItems = computed(() => {
  if (!order.value) return [];
  if (Array.isArray(order.value.items)) return order.value.items;
  return ds.orderItemsFor(order.value.id).map(item => ({
    productId: item.productId,
    qty: item.quantity,
    price: item.price,
    stockOk: item.stockOk,
  }));
});
const orderDate = computed(() => order.value?.date || order.value?.createdAt?.slice(0, 10) || '');
const orderEvents = computed(() => order.value ? ds.timelineForOrder(order.value.id) : []);
const confirmationChecks = computed(() => {
  if (!order.value) return [];
  return [
    { key: 'client', label: 'Client selected', ok: !!client.value },
    { key: 'items', label: 'Products attached', ok: displayItems.value.length > 0 },
    { key: 'stock', label: 'Stock available', ok: displayItems.value.every(item => item.stockOk !== false) },
    { key: 'total', label: 'Positive total', ok: Number(order.value.total || 0) > 0 },
  ];
});
const canConfirmOrder = computed(() => confirmationChecks.value.every(check => check.ok));

function confirmOrder() {
  if (!order.value) return;
  if (!canConfirmOrder.value) {
    toast.add({ severity: 'warn', summary: 'Validation pending', detail: 'Complete order checks before confirmation.', life: 3500 });
    return;
  }
  if (order.value.code) ds.updateOrderStatus(order.value.id, 'confirmed');
  else order.value.status = 'confirmed';
  toast.add({ severity: 'success', summary: t('orders.status.confirmed'), detail: `${order.value.id}`, life: 3500 });
}

function cancelOrder() {
  if (!order.value) return;
  order.value.status = 'cancelled';
  toast.add({ severity: 'warn', summary: t('orders.status.cancelled'), detail: `${order.value.id}`, life: 3500 });
  setTimeout(() => router.push('/ops/commercial/purchase-orders'), 1500);
}

const timeline = computed(() => {
  if (!order.value) return [];
  return ORDER_STATUS_FLOW.map((status, index) => {
    const state = orderStepState(order.value.status, status);
    return {
      title: orderStatusLabel(status),
      meta: formatTimelineDateTime(timelineEventForStep(orderEvents.value, status)?.timestamp || timelineEventForStep(orderEvents.value, status)?.createdAt || (index === 0 ? order.value?.createdAt || orderDate.value : null)),
      done: state === 'done' || state === 'active',
    };
  });
});
</script>

<template>
  <div v-if="!order" class="empty-state" style="padding:64px 20px;max-width:560px;margin:0 auto">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">{{ t('common.noResults') }}</div>
    <div class="empty-state-desc">{{ t('nav.orderDetail') }}</div>
    <button class="btn btn-primary" style="margin-top:16px" @click="router.push('/ops/commercial/purchase-orders')">
      <i class="pi pi-arrow-left"></i> {{ t('nav.orders') }}
    </button>
  </div>

  <template v-else>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn btn-ghost btn-sm" @click="router.push('/ops/commercial/purchase-orders')"><i class="pi pi-arrow-left"></i> {{ t('nav.orders') }}</button>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="page-title" style="font-family:'JetBrains Mono',monospace">{{ displayCode(order) }}</span>
        <span :class="'badge ' + orderStatusBadge(order.status)">{{ orderStatusLabel(order.status) }}</span>
        <span :class="'badge-priority-' + order.priority">{{ priorityLabel(order.priority) }}</span>
      </div>
      <div class="page-subtitle">{{ ds.clientName(order.clientId) }} · {{ orderDate }}</div>
    </div>
    <button class="btn btn-ghost" @click="toast.add({ severity:'info', summary:'Printing...', detail:'Opens the browser print dialog', life:2500 })"><i class="pi pi-print"></i> Print</button>
    <button class="btn btn-primary" v-if="order.status === 'validating'" @click="confirmOrder"><i class="pi pi-check"></i> Confirm</button>
    <button class="btn btn-danger" v-if="['blocked','validating'].includes(order.status)" @click="cancelOrder"><i class="pi pi-times"></i> Cancel</button>
  </div>

  <div class="banner banner-warning" v-if="order.notes">
    <i class="pi pi-info-circle"></i><div>{{ order.notes }}</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start">
    <div>
      <div class="card" style="overflow:hidden;margin-bottom:16px">
        <div class="card-header"><span class="card-title">Requested Products</span></div>
        <table class="data-table">
          <thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th><th>Stock</th></tr></thead>
          <tbody>
            <tr v-for="i in displayItems" :key="i.productId">
              <td>
                <div style="font-weight:500;font-size:13px">{{ ds.productName(i.productId) }}</div>
                <div class="mono" style="font-size:10px">{{ ds.productById(i.productId)?.sku }}</div>
              </td>
              <td>{{ i.qty }} {{ ds.productById(i.productId)?.unit }}</td>
              <td>S/ {{ i.price.toFixed(2) }}</td>
              <td style="font-weight:600">S/ {{ (i.qty * i.price).toFixed(2) }}</td>
              <td>
                <span :class="'badge ' + (i.stockOk ? 'badge-green' : 'badge-red')">
                  {{ i.stockOk ? 'Available' : 'Partial stock' }}
                </span>
              </td>
            </tr>
            <tr v-if="!displayItems.length"><td colspan="5"><div class="empty-state" style="padding:24px"><div class="empty-state-icon"><i class="pi pi-box"></i></div><div class="empty-state-title">No items</div></div></td></tr>
          </tbody>
        </table>
        <div style="padding:16px 20px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;font-weight:700;font-size:15px">
          <span>Total</span><span>S/ {{ order.total.toFixed(2) }}</span>
        </div>
      </div>

      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:16px">Timeline</div>
        <div class="timeline">
          <div v-for="(t, i) in timeline" :key="i" class="tl-item">
            <div class="tl-spine"></div>
            <div class="tl-dot" :style="{ background: t.done ? '#DCFCE7' : '#F3F4F6', color: t.done ? '#15803D' : '#9CA3AF' }">
              <i :class="'pi ' + (t.done ? 'pi-check' : 'pi-circle')"></i>
            </div>
            <div class="tl-content">
              <div class="tl-title" :style="{ color: t.done ? '#1F2937' : '#9CA3AF' }">{{ t.title }}</div>
              <div class="tl-meta">{{ t.meta }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card card-pad" v-if="client">
      <div style="margin-bottom:14px">
        <div class="card-title" style="margin-bottom:10px">Confirmation Checks</div>
        <div v-for="check in confirmationChecks" :key="check.key" style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:5px 0">
          <span>{{ check.label }}</span>
          <span :class="'badge ' + (check.ok ? 'badge-green' : 'badge-red')">{{ check.ok ? 'OK' : 'Review' }}</span>
        </div>
      </div>
      <div class="divider" style="margin:14px 0"></div>
      <div v-if="order.createdByName" style="margin-bottom:14px;padding:10px 12px;background:#F0F7FF;border:1px solid #BFDBFE;border-radius:8px">
        <div style="font-size:11px;font-weight:600;color:#2563EB;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Registered by</div>
        <div style="font-size:13px;font-weight:500;color:#1F2937">{{ order.createdByName }}</div>
        <div style="font-size:11px;color:#6B7280">{{ order.createdByRole }}</div>
      </div>
      <div class="card-title" style="margin-bottom:12px">Client</div>
      <div style="font-weight:600">{{ client.name }}</div>
      <div style="font-size:12px;color:#6B7280">{{ client.ruc }}</div>
      <div class="divider" style="margin:14px 0"></div>
      <div style="font-size:12px;color:#6B7280">Contact</div>
      <div style="font-size:13px">{{ client.contact }}</div>
      <div style="font-size:12px;color:#6B7280">{{ client.phone }}</div>
      <div class="divider" style="margin:14px 0"></div>
      <div style="font-size:12px;color:#6B7280">Address</div>
      <div style="font-size:13px">{{ client.address }}</div>
      <div class="divider" style="margin:14px 0"></div>
      <div style="font-size:12px;color:#6B7280">Condition</div>
      <div style="font-size:13px">{{ client.condition }}</div>
      <template v-if="client.creditLimit">
        <div class="divider" style="margin:14px 0"></div>
        <div style="font-size:12px;color:#6B7280;margin-bottom:6px">Credit Used</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:3px">
          <span>S/ {{ client.creditUsed.toLocaleString() }}</span>
          <span>S/ {{ client.creditLimit.toLocaleString() }}</span>
        </div>
        <div class="credit-bar-wrap">
          <div class="credit-bar" :style="{ width: Math.min(100, Math.round(client.creditUsed / client.creditLimit * 100)) + '%', background: client.creditUsed >= client.creditLimit ? '#EF4444' : '#22C55E' }"></div>
        </div>
      </template>
    </div>
  </div>
  </template>
</template>
