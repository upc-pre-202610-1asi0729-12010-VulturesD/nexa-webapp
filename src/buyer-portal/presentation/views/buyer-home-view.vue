<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { orderStatusLabel, orderStatusBadge, requestStatusLabel, requestStatusBadge, buildOrderTrackingSteps, displayCode, recordTimestamp } from '@/shared/status';
import { creditSummary } from '@/shared/credit';

const router = useRouter();
const ds = useDataStore();
const cart = useCartStore();
const auth = useAuthStore();
const D = ds.D;

const client = computed(() => ds.clientById(auth.user?.clientId));
const hasClient = computed(() => Boolean(client.value));
const myRequests = computed(() => D.purchaseRequests.filter(request => request.clientId === auth.user?.clientId));
const myOrders = computed(() => D.purchaseOrders.filter(order => order.clientId === auth.user?.clientId));
const credit = computed(() => creditSummary(client.value || {}));
const orderTime = (order) => recordTimestamp(order, ds.timelineForOrder(order.id));
const recentOrders = computed(() => [...myOrders.value].sort((a, b) => orderTime(b) - orderTime(a)));
const recentRequests = computed(() => [...myRequests.value].sort((a, b) => recordTimestamp(b) - recordTimestamp(a)));
const latestOrder = computed(() => recentOrders.value.find(order => !['delivered', 'cancelled', 'rejected'].includes(order.status)) || recentOrders.value[0]);
const latestRequest = computed(() => recentRequests.value.find(request => !['converted_to_order', 'rejected'].includes(request.status)) || recentRequests.value[0]);
const currentActivity = computed(() => {
  const order = latestOrder.value;
  const request = latestRequest.value;
  if (!order && !request) return null;
  if (!order) return { type: 'request', record: request };
  if (!request) return { type: 'order', record: order };
  return recordTimestamp(request) > orderTime(order)
    ? { type: 'request', record: request }
    : { type: 'order', record: order };
});
const activeOrder = computed(() => currentActivity.value?.type === 'order' ? currentActivity.value.record : null);
const activeRequest = computed(() => currentActivity.value?.type === 'request' ? currentActivity.value.record : null);
const activePromos = computed(() => D.promotions.filter(promo => promo.status === 'active' && ['buyer_portal', 'client_specific'].includes(promo.visibility)).slice(0, 3));
const featured = computed(() => D.products.filter(product => product.isVisibleToBuyer && product.status !== 'out').slice(0, 4));
const trackingSteps = computed(() => activeOrder.value ? buildOrderTrackingSteps(activeOrder.value, ds.timelineForOrder(activeOrder.value.id)) : []);

</script>

<template>
  <div v-if="!hasClient" class="empty-state" style="padding:60px 20px;max-width:560px;margin:0 auto">
    <div class="empty-state-icon"><i class="pi pi-ban"></i></div>
    <div class="empty-state-title">B2B account without a linked client</div>
    <div class="empty-state-desc">Requests, purchase orders and business documents require a linked client account.</div>
  </div>

  <template v-else>
    <section class="buyer-shell-band" style="margin-bottom:22px">
      <div style="position:relative;z-index:1;max-width:860px">
        <div class="demo-label" style="background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.26);margin-bottom:12px">Standard Buyer Portal</div>
        <div class="buyer-title">Hello, {{ auth.user?.name?.split(' ')[0] }}. Your refrigerated order flow is under control.</div>
        <div class="buyer-subtitle" style="margin-top:10px">
          {{ client.commercialName || client.name }} can request products, review commercial validation, track dispatch orders and access reference documents.
        </div>
        <div class="flow-row" style="margin-top:18px">
          <button class="btn btn-secondary" style="background:#fff;color:#1D4ED8;border-color:#fff" @click="router.push('/portal/product-catalog')">
            <i class="pi pi-box"></i> Product Catalog
          </button>
          <button class="btn btn-secondary" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.24)" @click="router.push('/portal/request-builder')">
            <i class="pi pi-shopping-cart"></i> Request Builder
          </button>
        </div>
      </div>
    </section>

    <div class="buyer-kpi-grid" style="margin-bottom:22px">
      <button class="buyer-card flow-panel-pad" style="text-align:left" @click="router.push('/portal/product-catalog')">
        <div class="flow-kpi-icon"><i class="pi pi-box"></i></div>
        <div class="flow-title" style="margin-top:10px">Product Catalog</div>
        <div class="flow-note">Authorized products and commercial availability.</div>
      </button>
      <button class="buyer-card flow-panel-pad" style="text-align:left" @click="router.push('/portal/purchase-requests')">
        <div class="flow-kpi-icon" style="background:#FEF3C7;color:#B45309"><i class="pi pi-inbox"></i></div>
        <div class="flow-title" style="margin-top:10px">My Requests</div>
        <div class="flow-note">{{ myRequests.length }} request(s), with S1 validation.</div>
      </button>
      <button class="buyer-card flow-panel-pad" style="text-align:left" @click="router.push('/portal/purchase-orders')">
        <div class="flow-kpi-icon" style="background:#ECFEFF;color:#0891B2"><i class="pi pi-truck"></i></div>
        <div class="flow-title" style="margin-top:10px">My Orders</div>
        <div class="flow-note">{{ myOrders.length }} confirmed or historical purchase order(s).</div>
      </button>
      <button class="buyer-card flow-panel-pad" style="text-align:left" @click="router.push('/portal/business-documents')">
        <div class="flow-kpi-icon" style="background:#F0FDF4;color:#15803D"><i class="pi pi-file-check"></i></div>
        <div class="flow-title" style="margin-top:10px">Business Documents</div>
        <div class="flow-note">Reference invoice, guide, CDR and POD documents.</div>
      </button>
      <button class="buyer-card flow-panel-pad" style="text-align:left" @click="router.push('/portal/profile')">
        <div class="flow-kpi-icon" style="background:#EEF2FF;color:#4F46E5"><i class="pi pi-credit-card"></i></div>
        <div class="flow-title" style="margin-top:10px">Monthly Credit</div>
        <div class="flow-note">Available S/ {{ credit.available.toLocaleString() }} of S/ {{ credit.limit.toLocaleString() }}.</div>
      </button>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Current Status</div>
            <div class="flow-subtitle">Tracking connected to validation, business documents and dispatch orders.</div>
          </div>
          <span v-if="activeOrder" :class="'badge ' + orderStatusBadge(activeOrder.status)">{{ orderStatusLabel(activeOrder.status) }}</span>
          <span v-else-if="activeRequest" :class="'badge ' + requestStatusBadge(activeRequest.status)">{{ requestStatusLabel(activeRequest.status) }}</span>
        </div>
        <div class="flow-panel-pad">
          <template v-if="activeOrder">
            <div class="flow-row-between" style="margin-bottom:16px">
              <div>
                <div class="mono" style="font-size:17px;font-weight:800;color:#1D4ED8">{{ displayCode(activeOrder) }}</div>
                <div class="flow-note">Requested delivery {{ activeOrder.requestedDeliveryDate }} - {{ activeOrder.totalEstimatedWeightKg }} estimated kg</div>
              </div>
              <button class="btn btn-primary" @click="router.push('/portal/purchase-orders/' + activeOrder.id)">Open Tracking</button>
            </div>
            <div class="flow-timeline-horizontal">
              <div
                v-for="step in trackingSteps"
                :key="step.key"
                class="flow-track-step"
                :class="step.state"
              >
                <div class="flow-track-index">{{ step.index }}</div>
                <div class="flow-track-label">{{ step.label }}</div>
                <div class="flow-track-date">{{ step.dateLabel }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="activeRequest">
            <div class="banner banner-info" style="margin-bottom:0">
              <i class="pi pi-info-circle"></i>
              <div>Your request <strong>{{ displayCode(activeRequest) }}</strong> is {{ requestStatusLabel(activeRequest.status) }}. S1 will review it before confirming the purchase order.</div>
            </div>
          </template>
          <template v-else>
            <div class="empty-state" style="padding:28px">
              <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
              <div class="empty-state-title">No active request</div>
              <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">Explore Catalog</button>
            </div>
          </template>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div class="flow-title">Active Offers</div>
          <span class="premium-lock"><i class="pi pi-lock"></i> Premium</span>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="promo in activePromos" :key="promo.id" class="flow-list-item">
            <div>
              <div style="font-weight:800">{{ promo.name }}</div>
              <div class="flow-note">{{ promo.discountLabel }} - {{ promo.notes }}</div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="router.push('/portal/product-catalog')">View</button>
          </div>
          <button class="btn btn-ghost" @click="router.push('/portal/premium')"><i class="pi pi-sparkles"></i> View Premium Previews</button>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Suggested Products</div>
            <div class="flow-subtitle">Authorized visual catalog for purchase requests, not direct final purchases.</div>
          </div>
        </div>
        <div class="grid-4 flow-panel-pad">
          <article v-for="product in featured" :key="product.id" class="buyer-card">
            <div class="buyer-product-visual" :class="'cat-' + product.cat"><i class="pi pi-box"></i></div>
            <div style="padding:14px">
              <div style="font-weight:800;font-size:13px">{{ product.name }}</div>
              <div class="flow-note">{{ product.category }} - {{ product.temperatureRange }}</div>
              <div class="flow-row-between" style="margin-top:12px">
                <strong>S/ {{ product.price.toFixed(2) }}</strong>
                <button class="add-btn add-btn-default" @click="cart.add(product)"><i class="pi pi-plus"></i></button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </template>
</template>
