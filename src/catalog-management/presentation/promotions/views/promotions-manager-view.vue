<script setup>
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';
import { coldTypeLabel, coldTypeBadge } from '@/shared/status';

const toast = useToast();
const ds = useDataStore();
const D = ds.D;

const statusOptions = ['active', 'scheduled', 'paused'];

function plusDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const form = ref({
  name: '',
  visibility: 'buyer_portal',
  status: 'active',
  startDate: plusDaysISO(0),
  endDate: plusDaysISO(15),
  productIds: [],
  notes: '',
  discountLabel: '',
});

const activePromos = computed(() => D.promotions.filter(item => item.status === 'active'));
const buyerVisible = computed(() => D.promotions.filter(item => item.visibility === 'buyer_portal'));

function toggleProduct(productId) {
  const set = new Set(form.value.productIds);
  if (set.has(productId)) set.delete(productId);
  else set.add(productId);
  form.value.productIds = [...set];
}

function createPromotion() {
  if (!form.value.name || !form.value.productIds.length) {
    toast.add({ severity: 'warn', summary: 'Incomplete data', detail: 'Add a name and at least one product.', life: 3000 });
    return;
  }
  const status = form.value.status || (form.value.startDate > plusDaysISO(0) ? 'scheduled' : 'active');
  ds.addPromotion({ ...form.value, status });
  toast.add({ severity: 'success', summary: 'Promotion created', detail: `${form.value.name} is ${status}. Subject to commercial validation.`, life: 3000 });
  form.value = {
    name: '',
    visibility: 'buyer_portal',
    status: 'active',
    startDate: plusDaysISO(0),
    endDate: plusDaysISO(15),
    productIds: [],
    notes: '',
    discountLabel: '',
  };
}

function updateStatus(promo, status) {
  ds.updatePromotionStatus(promo.id, status);
  toast.add({ severity: status === 'active' ? 'success' : 'info', summary: 'Promotion status updated', detail: `${promo.name}: ${status}`, life: 2500 });
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Promotions Manager</div>
      <div class="page-subtitle">Operations-owned Buyer Portal promotions, always subject to commercial validation.</div>
    </div>
    <span class="demo-label">Commercial campaigns</span>
  </div>

  <div class="grid-3" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-megaphone" style="color:#2563EB"></i> Active</div>
      <div class="kpi-value" style="color:#2563EB">{{ activePromos.length }}</div>
      <div class="kpi-sub">Current campaigns</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-eye" style="color:#0891B2"></i> Buyer Portal</div>
      <div class="kpi-value" style="color:#0891B2">{{ buyerVisible.length }}</div>
      <div class="kpi-sub">Visible to S3</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-lock" style="color:#4F46E5"></i> Premium preview</div>
      <div class="kpi-value" style="color:#4F46E5">3</div>
      <div class="kpi-sub">Future advanced campaigns</div>
    </div>
  </div>

  <div class="flow-grid-12">
    <section class="flow-panel span-7">
      <div class="flow-panel-head">
        <div>
          <div class="flow-title">Registered Promotions</div>
          <div class="flow-subtitle">Shown as controlled badges and offers in the S3 buyer portal.</div>
        </div>
      </div>
      <div class="flow-panel-pad flow-stack">
        <div v-for="promo in D.promotions" :key="promo.id" class="flow-list-item">
          <div>
            <div class="flow-row" style="margin-bottom:6px">
              <strong>{{ promo.name }}</strong>
              <span :class="'badge ' + (promo.status === 'active' ? 'badge-green' : promo.status === 'scheduled' ? 'badge-blue' : 'badge-gray')">{{ promo.status }}</span>
              <span class="flow-pill">{{ promo.visibility }}</span>
            </div>
            <div class="flow-note">{{ promo.startDate }} -> {{ promo.endDate }} - {{ promo.notes }}</div>
            <div class="flow-note">Subject to commercial validation.</div>
            <div class="flow-row" style="margin-top:8px;flex-wrap:wrap">
              <span v-for="productId in promo.productIds" :key="productId" class="flow-pill flow-pill-blue">{{ ds.productName(productId) }}</span>
            </div>
          </div>
          <div class="flow-stack" style="min-width:150px">
            <strong>{{ promo.discountLabel || 'Commercial condition' }}</strong>
            <select class="plain-select" :value="promo.status" @change="updateStatus(promo, $event.target.value)" aria-label="Promotion status">
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="flow-panel span-5">
      <div class="flow-panel-head"><div class="flow-title">Create Promotion</div></div>
      <div class="flow-panel-pad flow-stack">
        <label class="field">
          <span class="field-label">Name</span>
          <input v-model="form.name" class="plain-input" placeholder="Imported dairy campaign" />
        </label>
        <div class="form-grid">
          <label class="field">
            <span class="field-label">Start</span>
            <input v-model="form.startDate" type="date" class="plain-input" />
          </label>
          <label class="field">
            <span class="field-label">End</span>
            <input v-model="form.endDate" type="date" class="plain-input" />
          </label>
        </div>
        <label class="field">
          <span class="field-label">Visibility</span>
          <select v-model="form.visibility" class="plain-select">
            <option value="internal_only">Internal only</option>
            <option value="buyer_portal">Buyer Portal</option>
            <option value="client_specific">Client specific</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Status</span>
          <select v-model="form.status" class="plain-select">
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Commercial label</span>
          <input v-model="form.discountLabel" class="plain-input" placeholder="8% reference / campaign price" />
        </label>
        <div>
          <div class="field-label" style="margin-bottom:8px">Included Products</div>
          <div class="flow-stack" style="max-height:260px;overflow:auto">
            <button
              v-for="product in D.products"
              :key="product.id"
              class="flow-row-between"
              style="border:1px solid #E5E7EB;border-radius:10px;background:#fff;padding:9px 10px;text-align:left"
              :style="form.productIds.includes(product.id) ? 'border-color:#2563EB;background:#EFF6FF' : ''"
              @click="toggleProduct(product.id)"
            >
              <span>
                <strong>{{ product.name }}</strong>
                <span class="flow-note" style="display:block">{{ product.sku }}</span>
              </span>
              <span :class="coldTypeBadge(product.coldType)">{{ coldTypeLabel(product.coldType) }}</span>
            </button>
          </div>
        </div>
        <textarea v-model="form.notes" class="plain-textarea" placeholder="Notes and commercial validation restrictions"></textarea>
        <button class="btn btn-primary" @click="createPromotion"><i class="pi pi-check"></i> Save Promotion</button>
      </div>
    </section>
  </div>
</template>
