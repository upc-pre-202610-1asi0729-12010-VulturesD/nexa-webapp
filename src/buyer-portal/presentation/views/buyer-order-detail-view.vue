<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, orderStatusBadge, orderStepState, documentStatusLabel, documentStatusBadge, coldTypeLabel, coldTypeBadge } from '@/shared/status';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const order = computed(() => {
  const found = ds.purchaseOrderById(route.params.id);
  return found?.clientId === auth.user?.clientId ? found : null;
});
const dispatch = computed(() => order.value ? ds.dispatchForOrder(order.value.id) : null);
const address = computed(() => order.value ? ds.deliveryAddressById(order.value.deliveryAddressId) : null);
const docs = computed(() => order.value ? ds.documentsForOrder(order.value.id).filter(doc => doc.visibleToBuyer || doc.required) : []);
const items = computed(() => order.value ? ds.orderItemsFor(order.value.id) : []);
const events = computed(() => order.value ? ds.timelineForOrder(order.value.id).filter(event => event.visibleToBuyer) : []);
const temps = computed(() => order.value ? ds.temperatureForOrder(order.value.id).filter(log => log.visibleToBuyer) : []);

const steps = [
  ['submitted', 'Request received'],
  ['validating', 'Commercial validation'],
  ['confirmed', 'Purchase order confirmed'],
  ['document_pending', 'Business documents prepared'],
  ['ready_for_dispatch', 'Ready for operations'],
  ['preparing', 'Preparing dispatch'],
  ['in_route', 'On route'],
  ['delivered', 'Delivered'],
];
</script>

<template>
  <div v-if="!order" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">Purchase Order not available</div>
    <button class="btn btn-primary" @click="router.push('/portal/purchase-orders')">My Orders</button>
  </div>

  <template v-else>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <button class="btn btn-ghost btn-sm" @click="router.push('/portal/purchase-orders')"><i class="pi pi-arrow-left"></i> Purchase Orders</button>
      <div style="flex:1">
        <div class="flow-row">
          <span class="page-title mono">{{ order.id }}</span>
          <span :class="'badge ' + orderStatusBadge(order.status)">{{ orderStatusLabel(order.status) }}</span>
        </div>
        <div class="page-subtitle">Delivery {{ order.requestedDeliveryDate }} - {{ dispatch?.routeName || 'Route not assigned yet' }}</div>
      </div>
      <span class="demo-label">Simulated tracking</span>
    </div>

    <section class="buyer-shell-band" style="margin-bottom:18px">
      <div style="position:relative;z-index:1">
        <div class="buyer-title">{{ orderStatusLabel(order.status) }}</div>
        <div class="buyer-subtitle" style="margin-top:8px">
          {{ address?.label || 'Registered address' }} - {{ address?.address || 'Delivery coordinated by operations' }}.
          Status updates come from the S2 Dispatch Orders board.
        </div>
      </div>
    </section>

    <div class="flow-grid-12">
      <section class="flow-panel span-12">
        <div class="flow-panel-head"><div class="flow-title">Purchase Order Timeline</div></div>
        <div class="flow-panel-pad">
          <div class="flow-timeline-horizontal">
            <div v-for="([key, label], index) in steps" :key="key" class="flow-track-step" :class="orderStepState(order.status, key)">
              <div class="flow-track-index">{{ index + 1 }}</div>
              <div class="flow-track-label">{{ label }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head"><div class="flow-title">Products</div></div>
        <table class="data-table">
          <thead><tr><th>Product</th><th>Cold Chain</th><th>Quantity</th></tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div style="font-weight:800">{{ ds.productName(item.productId) }}</div>
                <div class="flow-note">{{ ds.productById(item.productId)?.sku }}</div>
              </td>
              <td><span :class="coldTypeBadge(ds.productById(item.productId)?.coldType)">{{ coldTypeLabel(ds.productById(item.productId)?.coldType) }}</span></td>
              <td>{{ item.quantity }} {{ item.unit }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div class="flow-title">Available Business Documents</div>
          <button class="btn btn-ghost btn-sm" @click="router.push('/portal/business-documents')">View All</button>
        </div>
        <div class="flow-panel-pad">
          <div v-for="doc in docs" :key="doc.id" class="document-check">
            <div>
              <div style="font-weight:800">{{ doc.label }}</div>
              <div class="flow-note">{{ doc.fileName }}</div>
            </div>
            <div class="flow-row">
              <span :class="'badge ' + documentStatusBadge(doc.status)">{{ documentStatusLabel(doc.status) }}</span>
              <button class="btn btn-secondary btn-sm" :disabled="!doc.visibleToBuyer">Download</button>
            </div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head"><div class="flow-title">Visible Events</div></div>
        <div class="flow-panel-pad">
          <div class="timeline">
            <div v-for="event in events" :key="event.id" class="tl-item">
              <div class="tl-spine"></div>
              <div class="tl-dot" style="background:#DBEAFE;color:#1D4ED8"><i class="pi pi-check"></i></div>
              <div class="tl-content">
                <div class="tl-title">{{ event.label }}</div>
                <div class="tl-meta">{{ new Date(event.timestamp).toLocaleString('en-US') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div class="flow-title">Map / temperature</div>
          <span class="premium-lock"><i class="pi pi-lock"></i> Preview</span>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="banner banner-info" style="margin-bottom:0">
            <i class="pi pi-map"></i>
            <div>Map tracking and telemetry are simulated for the demo; real integration remains a future Premium capability.</div>
          </div>
          <div v-for="log in temps" :key="log.id" class="flow-row-between">
            <span>{{ new Date(log.timestamp).toLocaleTimeString('en-US') }}</span>
            <strong>{{ log.temperatureC }} C - {{ log.status }}</strong>
          </div>
        </div>
      </section>
    </div>
  </template>
</template>
