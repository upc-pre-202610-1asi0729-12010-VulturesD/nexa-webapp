<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { coldTypeBadge, coldTypeLabel } from '@/shared/status';
import { brandForProduct } from '@/catalog-management/application/product-catalog/product-brand';

const { t } = useI18n();
const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const search = ref('');
const filter = ref('all');
const stockFilter = ref('all');
const coldTypeFilter = ref('all');
const brandFilter = ref('all');
const categories = computed(() => [...new Set(D.products.map(p => p.category))]);
const coldTypes = computed(() => ['all', ...new Set(D.products.map(p => p.coldType).filter(Boolean))]);
const brands = computed(() => ['all', ...new Set(D.products.map(product => brandForProduct(product)).filter(Boolean))]);
const categorySummary = computed(() =>
  categories.value.map(category => ({
    category,
    total: D.products.filter(product => product.category === category).length,
    low: D.products.filter(product => product.category === category && product.status === 'low').length,
  }))
);

const filtered = computed(() => {
  let p = D.products;
  if (filter.value !== 'all') p = p.filter(x => x.category === filter.value);
  if (stockFilter.value !== 'all') p = p.filter(x => x.status === stockFilter.value);
  if (coldTypeFilter.value !== 'all') p = p.filter(x => x.coldType === coldTypeFilter.value);
  if (brandFilter.value !== 'all') p = p.filter(x => brandForProduct(x) === brandFilter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    p = p.filter(x =>
      x.name.toLowerCase().includes(q) ||
      x.sku.toLowerCase().includes(q) ||
      x.category.toLowerCase().includes(q) ||
      brandForProduct(x).toLowerCase().includes(q)
    );
  }
  return p;
});
const filteredSummary = computed(() => t('catalog.filteredSummary', { visible: filtered.value.length, total: D.products.length }));

const detail = ref(null);
function openDetail(p) { detail.value = p; }
function closeDetail() { detail.value = null; }

function statusLabel(s) {
  return s === 'ok' ? t('catalog.available') : s === 'low' ? t('catalog.lowStock') : t('catalog.outOfStock');
}
function statusBadge(s) {
  return 'badge-' + ({ ok: 'green', low: 'amber', out: 'red' }[s] || 'gray');
}
function hasActiveDemand(product) {
  return D.orderItems.some(item => item.productId === product.id) ||
    D.requestItems.some(item => item.productId === product.id);
}
function editGuardLabel(product) {
  if (hasActiveDemand(product)) return t('catalog.activeDemandGuard');
  if (product.status === 'out') return t('catalog.outStockGuard');
  return t('catalog.readyMaintenance');
}
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.catalog') }}</div>
      <div class="page-subtitle">{{ D.products.length }} {{ t('catalog.subtitle') }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry')">
      <i class="pi pi-file-edit" aria-hidden="true"></i> {{ t('nav.createOrder') }}
    </button>
  </div>

  <div class="filter-bar catalog-management-filter-bar" role="toolbar" :aria-label="t('catalog.filters')">
    <div class="search-input">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input v-model="search" :placeholder="t('catalog.searchFullPlaceholder')" :aria-label="t('catalog.searchFullPlaceholder')" />
    </div>
    <div class="catalog-management-filter-scroll" :aria-label="t('catalog.filters')">
      <button class="filter-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'" :aria-pressed="filter === 'all'">{{ t('common.all') }}</button>
      <button v-for="cat in categories" :key="cat" class="filter-chip" :class="{ active: filter === cat }" @click="filter = cat" :aria-pressed="filter === cat">{{ cat }}</button>
      <button v-for="status in ['all','ok','low','out']" :key="status" class="filter-chip" :class="{ active: stockFilter === status }" @click="stockFilter = status" :aria-pressed="stockFilter === status">
        {{ status === 'all' ? t('catalog.allStock') : statusLabel(status) }}
      </button>
      <button v-for="type in coldTypes" :key="type" class="filter-chip" :class="{ active: coldTypeFilter === type }" @click="coldTypeFilter = type" :aria-pressed="coldTypeFilter === type">
        {{ type === 'all' ? t('catalog.allColdTypes') : coldTypeLabel(type) }}
      </button>
      <button v-for="brand in brands" :key="brand" class="filter-chip" :class="{ active: brandFilter === brand }" @click="brandFilter = brand" :aria-pressed="brandFilter === brand">
        {{ brand === 'all' ? t('catalog.allBrands') : brand }}
      </button>
    </div>
    <span class="flow-note">{{ filteredSummary }}</span>
  </div>

  <div class="catalog-grid" role="list" :aria-label="t('nav.catalog')">
    <div
      v-for="p in filtered"
      :key="p.id"
      class="card"
      style="overflow:hidden;display:flex;flex-direction:column;cursor:pointer"
      role="button"
      tabindex="0"
      :aria-label="t('catalog.viewDetailsFor', { name: p.name })"
      @click="openDetail(p)"
      @keydown.enter.prevent="openDetail(p)"
      @keydown.space.prevent="openDetail(p)"
    >
      <div class="product-placeholder" :class="'cat-' + p.cat" style="position:relative" :aria-label="p.name">
        <img v-if="p.imageUrl" class="catalog-product-image" :src="p.imageUrl" :alt="p.name" loading="lazy" />
        <template v-else>
          <div class="pp-icon"><i class="pi pi-box" aria-hidden="true"></i></div>
          <div class="pp-cat">{{ p.category }}</div>
          <div class="pp-hint">{{ t('catalog.productImage') }}</div>
        </template>
        <div v-if="p.status === 'out'" style="position:absolute;inset:0;background:rgba(249,247,244,0.7);display:flex;align-items:center;justify-content:center">
          <span class="badge badge-red">{{ t('catalog.outOfStock') }}</span>
        </div>
      </div>
      <div style="padding:12px;flex:1">
        <div style="font-size:13px;font-weight:500;color:#111827;line-height:1.3;margin-bottom:5px">{{ p.name }}</div>
        <div class="mono" style="font-size:10px;margin-bottom:8px">{{ p.sku }}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span :class="coldTypeBadge(p.coldType)">{{ coldTypeLabel(p.coldType) }}</span>
          <span class="badge-temp">{{ p.temp }}</span>
          <span :class="'badge ' + statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
        </div>
        <div class="catalog-brand-line">{{ t('catalog.brandLine', { brand: brandForProduct(p) }) }}</div>
      </div>
      <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price.toFixed(2) }}</span>
        <span style="font-size:11px;color:#6B7280">{{ p.stock - p.reserved }} {{ p.unit }} {{ t('catalog.dispUnit') }}</span>
      </div>
    </div>
  </div>

  <div class="grid-3" style="margin-top:18px">
    <div v-for="item in categorySummary" :key="item.category" class="card card-pad">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div>
          <div class="card-title">{{ item.category }}</div>
          <div class="flow-note">{{ item.total }} {{ t('catalog.productCount') }}</div>
        </div>
        <span :class="'badge ' + (item.low ? 'badge-amber' : 'badge-green')">{{ item.low ? t('catalog.lowCount', { count: item.low }) : t('catalog.ok') }}</span>
      </div>
    </div>
  </div>

  <!-- Product detail modal -->
  <transition name="fade">
    <div
      v-if="detail"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1100;padding:16px"
      role="dialog"
      aria-modal="true"
      :aria-label="'Details for ' + detail.name"
      tabindex="-1"
      @click.self="closeDetail"
      @keydown.esc.prevent="closeDetail"
    >
      <div class="card" style="max-width:540px;width:100%;overflow:hidden">
        <div :class="'product-placeholder cat-' + detail.cat" style="height:160px;border-radius:0">
          <img v-if="detail.imageUrl" class="catalog-product-image" :src="detail.imageUrl" :alt="detail.name" />
          <template v-else>
            <div class="pp-icon" style="font-size:40px"><i class="pi pi-box" aria-hidden="true"></i></div>
            <div class="pp-cat">{{ detail.category }}</div>
          </template>
        </div>
        <div style="padding:20px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px">
            <div>
              <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px">{{ detail.name }}</div>
              <div class="mono" style="font-size:11px;color:#9CA3AF">{{ detail.sku }}</div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="closeDetail" :aria-label="t('common.close')"><i class="pi pi-times"></i></button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.temperature') }}</div>
              <div style="font-size:13px;font-weight:500;display:flex;gap:4px;align-items:center">
                <i class="pi pi-thermometer" style="color:#2563EB;font-size:12px"></i> {{ detail.temp }}
              </div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.unit') }}</div>
              <div style="font-size:13px;font-weight:500">{{ detail.unit }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.availableStock') }}</div>
              <div style="font-size:15px;font-weight:700">{{ detail.stock - detail.reserved }} <span style="font-size:12px;font-weight:400;color:#6B7280">{{ detail.unit }}</span></div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.price') }}</div>
              <div style="font-size:16px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif">S/ {{ detail.price.toFixed(2) }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.warehouse') }}</div>
              <div style="font-size:13px;font-weight:500">{{ detail.warehouse }} / {{ detail.zone }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.status') }}</div>
              <span :class="'badge ' + statusBadge(detail.status)">{{ statusLabel(detail.status) }}</span>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.coldType') }}</div>
              <span :class="coldTypeBadge(detail.coldType)">{{ coldTypeLabel(detail.coldType) }}</span>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">{{ t('catalog.brand') }}</div>
              <div style="font-size:13px;font-weight:500">{{ brandForProduct(detail) }}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <span :class="'badge ' + (hasActiveDemand(detail) ? 'badge-amber' : 'badge-green')" style="margin-right:auto">{{ editGuardLabel(detail) }}</span>
            <button class="btn btn-ghost" @click="closeDetail">{{ t('common.close') }}</button>
            <button class="btn btn-secondary" :disabled="hasActiveDemand(detail)">
              <i class="pi pi-pencil"></i> {{ t('common.edit') }}
            </button>
            <button class="btn btn-danger" :disabled="hasActiveDemand(detail) || detail.status !== 'out'">
              <i class="pi pi-trash"></i> {{ t('catalog.remove') }}
            </button>
            <button class="btn btn-primary" @click="router.push('/ops/commercial/manual-order-entry'); closeDetail()">
              <i class="pi pi-file-edit"></i> {{ t('catalog.manualEntry') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.catalog-management-filter-bar {
  align-items: flex-start;
}
.catalog-management-filter-bar .search-input {
  min-width: min(100%, 320px);
}
.catalog-management-filter-scroll {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
.catalog-management-filter-scroll .filter-chip {
  flex: 0 0 auto;
}
@media (min-width: 1500px) { .catalog-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1900px) { .catalog-grid { grid-template-columns: repeat(6, 1fr); } }
@media (max-width: 1100px) { .catalog-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 800px)  { .catalog-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) {
  .catalog-management-filter-bar {
    gap: 10px;
  }
  .catalog-management-filter-scroll {
    width: 100%;
  }
}
@media (max-width: 480px)  { .catalog-grid { grid-template-columns: 1fr; } }
</style>
