<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, orderStatusBadge, coldTypeLabel, coldTypeBadge, documentStatusLabel, documentStatusBadge } from '@/shared/status';
import { creditSummary } from '@/shared/credit';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const ds = useDataStore();

const dispatch = computed(() => ds.dispatchOrderById(route.params.id));
const order = computed(() => dispatch.value ? ds.purchaseOrderById(dispatch.value.orderId) : null);
const client = computed(() => dispatch.value ? ds.clientById(dispatch.value.clientId) : null);
const address = computed(() => dispatch.value ? ds.deliveryAddressById(dispatch.value.deliveryAddressId) : null);
const docs = computed(() => order.value ? ds.documentsForOrder(order.value.id) : []);
const items = computed(() => order.value ? ds.orderItemsFor(order.value.id) : []);
const events = computed(() => order.value ? ds.timelineForOrder(order.value.id) : []);
const temps = computed(() => order.value ? ds.temperatureForOrder(order.value.id) : []);
const pod = computed(() => dispatch.value ? ds.D.proofOfDelivery.find(item => item.dispatchOrderId === dispatch.value.id) : null);
const credit = computed(() => creditSummary(client.value || {}));
const temperatureSummary = computed(() => {
  const records = temps.value;
  const alerts = records.filter(log => log.status !== 'ok');
  return {
    total: records.length,
    alerts: alerts.length,
    latest: records[records.length - 1],
  };
});

function setStatus(status) {
  ds.updateDispatchStatus(dispatch.value.id, status);
  toast.add({ severity: status === 'delivered' ? 'success' : status === 'incident' ? 'warn' : 'info', summary: orderStatusLabel(status), detail: dispatch.value.id, life: 3000 });
}
</script>

<template>
  <div v-if="!dispatch" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">Dispatch order not found</div>
    <button class="btn btn-primary" @click="router.push('/ops/operations/dispatch-orders')">Back to board</button>
  </div>

  <template v-else>
    <div class="page-header">
      <div>
        <div class="flow-row" style="margin-bottom:5px">
          <button class="btn btn-ghost btn-sm" @click="router.push('/ops/operations/dispatch-orders')"><i class="pi pi-arrow-left"></i> Board</button>
          <span class="page-title mono">{{ dispatch.id }}</span>
          <span :class="'badge ' + orderStatusBadge(dispatch.status)">{{ orderStatusLabel(dispatch.status) }}</span>
          <span :class="coldTypeBadge(dispatch.coldType)">{{ coldTypeLabel(dispatch.coldType) }}</span>
        </div>
        <div class="page-subtitle">{{ ds.clientName(dispatch.clientId) }} - {{ dispatch.routeName }} - ETA {{ new Date(dispatch.eta).toLocaleString('en-US') }}</div>
      </div>
      <div class="flow-row">
        <button class="btn btn-secondary" @click="setStatus('preparing')"><i class="pi pi-box"></i> Prepare</button>
        <button class="btn btn-secondary" @click="setStatus('in_route')"><i class="pi pi-send"></i> On route</button>
        <button class="btn btn-success" @click="setStatus('delivered')"><i class="pi pi-check"></i> Delivered</button>
        <button class="btn btn-danger" @click="setStatus('incident')"><i class="pi pi-exclamation-triangle"></i> Incident</button>
      </div>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-4">
        <div class="flow-panel-head"><div class="flow-title">Operational Summary</div></div>
        <div class="flow-panel-pad flow-stack">
          <div>
            <div class="flow-eyebrow">Client</div>
            <div style="font-size:15px;font-weight:800">{{ client?.businessName || client?.name }}</div>
            <div class="flow-note">{{ client?.ruc }} - {{ client?.condition }}</div>
          </div>
          <div>
            <div class="flow-eyebrow">Address</div>
            <div style="font-size:13px;font-weight:700">{{ address?.label || client?.address || 'Registered address' }}</div>
            <div class="flow-note">{{ address?.address || client?.address }}</div>
          </div>
          <div class="flow-row-between"><span>Purchase Order</span><strong class="mono">{{ dispatch.orderId }}</strong></div>
          <div class="flow-row-between"><span>Driver</span><strong>{{ dispatch.driverName }}</strong></div>
          <div class="flow-row-between"><span>Owner</span><strong>{{ dispatch.responsible }}</strong></div>
          <div class="credit-summary-box">
            <div class="flow-row-between">
              <span>Credit condition</span>
              <span :class="'badge ' + credit.badgeClass">{{ credit.statusLabel }}</span>
            </div>
            <template v-if="credit.limit">
              <div class="flow-row-between"><span>Available</span><strong>S/ {{ credit.available.toLocaleString() }}</strong></div>
              <div class="credit-bar-wrap" role="progressbar" :aria-valuenow="credit.percent" aria-valuemin="0" aria-valuemax="100">
                <div class="credit-bar" :style="{ width: credit.percent + '%', background: credit.barColor }"></div>
              </div>
              <div class="flow-note">Period {{ credit.period }} - due {{ credit.dueDate }}</div>
            </template>
            <div class="flow-note">Visible for logistics coordination only. S1 owns commercial approval.</div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-8">
        <div class="flow-panel-head"><div class="flow-title">Dispatch Items</div></div>
        <table class="data-table">
          <thead><tr><th>Product</th><th>Quantity</th><th>Cold Chain</th><th>Stock</th></tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div style="font-weight:800">{{ ds.productName(item.productId) }}</div>
                <div class="flow-note">{{ ds.productById(item.productId)?.sku }}</div>
              </td>
              <td>{{ item.quantity }} {{ item.unit }} <span class="flow-note">({{ item.estimatedWeightKg }} kg)</span></td>
              <td><span :class="coldTypeBadge(ds.productById(item.productId)?.coldType)">{{ coldTypeLabel(ds.productById(item.productId)?.coldType) }}</span></td>
              <td><span :class="'badge ' + (item.stockOk ? 'badge-green' : 'badge-red')">{{ item.stockOk ? 'OK' : 'Partial' }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div class="flow-title">Business Documents before departure</div>
          <span class="demo-label">Checklist</span>
        </div>
        <div class="flow-panel-pad">
          <div v-for="doc in docs" :key="doc.id" class="document-check">
            <div>
              <div style="font-weight:800">{{ doc.label }}</div>
              <div class="flow-note">{{ doc.required ? 'Required' : 'Not required' }}</div>
            </div>
            <span :class="'badge ' + documentStatusBadge(doc.status)">{{ documentStatusLabel(doc.status) }}</span>
          </div>
        </div>
      </section>

      <section class="flow-panel span-6">
        <div class="flow-panel-head">
          <div class="flow-title">POD and temperature</div>
          <span class="demo-label">Simulated temperature</span>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div :class="temperatureSummary.alerts ? 'banner banner-warning' : 'banner banner-success'" style="margin-bottom:0">
            <i :class="temperatureSummary.alerts ? 'pi pi-exclamation-triangle' : 'pi pi-thermometer'"></i>
            <div>
              {{ temperatureSummary.alerts ? `${temperatureSummary.alerts} temperature record(s) require review.` : 'Temperature records remain inside expected range.' }}
            </div>
          </div>
          <div :class="pod?.status === 'complete' ? 'banner banner-success' : 'banner banner-warning'" style="margin-bottom:0">
            <i :class="pod?.status === 'complete' ? 'pi pi-check-circle' : 'pi pi-camera'"></i>
            <div>{{ pod?.status === 'complete' ? 'Simulated POD completed with photo/signature.' : 'POD pending: register reference photo and signature.' }}</div>
          </div>
          <div v-for="log in temps" :key="log.id" class="flow-row-between">
            <span>{{ new Date(log.timestamp).toLocaleTimeString('en-US') }}</span>
            <strong :style="{ color: log.status === 'ok' ? '#15803D' : '#B45309' }">{{ log.temperatureC }} C - {{ log.status }}</strong>
          </div>
          <button class="btn btn-primary" @click="setStatus('delivered')"><i class="pi pi-check"></i> Complete POD mock</button>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head"><div class="flow-title">Timeline visible to S3</div></div>
        <div class="flow-panel-pad">
          <div class="timeline">
            <div v-for="event in events" :key="event.id" class="tl-item">
              <div class="tl-spine"></div>
              <div class="tl-dot" style="background:#DBEAFE;color:#1D4ED8"><i class="pi pi-check"></i></div>
              <div class="tl-content">
                <div class="tl-title">{{ event.label }}</div>
                <div class="tl-meta">{{ new Date(event.timestamp).toLocaleString('en-US') }} - {{ event.visibleToBuyer ? 'buyer visible' : 'internal' }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
</template>
