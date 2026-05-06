<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';

const { t } = useI18n();
const router = useRouter();
const ds = useDataStore();
const D = ds.D;

const search = ref('');
const filter = ref('all');
const categories = computed(() => [...new Set(D.products.map(p => p.category))]);

const filtered = computed(() => {
  let p = D.products;
  if (filter.value !== 'all') p = p.filter(x => x.category === filter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    p = p.filter(x => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q));
  }
  return p;
});

const detail = ref(null);
function openDetail(p) { detail.value = p; }
function closeDetail() { detail.value = null; }

function statusLabel(s) {
  return s === 'ok' ? t('catalog.available') : s === 'low' ? t('catalog.lowStock') : t('catalog.outOfStock');
}
function statusBadge(s) {
  return 'badge-' + ({ ok: 'green', low: 'amber', out: 'red' }[s] || 'gray');
}
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.catalog') }}</div>
      <div class="page-subtitle">{{ D.products.length }} {{ t('catalog.subtitle') }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/ops/orders/new')">
      <i class="pi pi-file-edit" aria-hidden="true"></i> {{ t('nav.createOrder') }}
    </button>
  </div>

  <div class="filter-bar" role="toolbar" :aria-label="'Filtros'">
    <div class="search-input">
      <i class="pi pi-search" aria-hidden="true"></i>
      <input v-model="search" :placeholder="t('catalog.searchPlaceholder')" :aria-label="t('catalog.searchPlaceholder')" />
    </div>
    <button class="filter-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'" :aria-pressed="filter === 'all'">{{ t('common.all') }}</button>
    <button v-for="cat in categories" :key="cat" class="filter-chip" :class="{ active: filter === cat }" @click="filter = cat" :aria-pressed="filter === cat">{{ cat }}</button>
  </div>

  <div class="catalog-grid" role="list" :aria-label="t('nav.catalog')">
    <div
      v-for="p in filtered"
      :key="p.id"
      class="card"
      style="overflow:hidden;display:flex;flex-direction:column;cursor:pointer"
      role="button"
      tabindex="0"
      :aria-label="'Ver detalle de ' + p.name"
      @click="openDetail(p)"
      @keydown.enter.prevent="openDetail(p)"
      @keydown.space.prevent="openDetail(p)"
    >
      <div class="product-placeholder" :class="'cat-' + p.cat" style="position:relative" :aria-label="p.name">
        <div class="pp-icon"><i class="pi pi-box" aria-hidden="true"></i></div>
        <div class="pp-cat">{{ p.category }}</div>
        <div class="pp-hint">Imagen del producto</div>
        <div v-if="p.status === 'out'" style="position:absolute;inset:0;background:rgba(249,247,244,0.7);display:flex;align-items:center;justify-content:center">
          <span class="badge badge-red">{{ t('catalog.outOfStock') }}</span>
        </div>
      </div>
      <div style="padding:12px;flex:1">
        <div style="font-size:13px;font-weight:500;color:#111827;line-height:1.3;margin-bottom:5px">{{ p.name }}</div>
        <div class="mono" style="font-size:10px;margin-bottom:8px">{{ p.sku }}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="badge-temp">{{ p.temp }}</span>
          <span :class="'badge ' + statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
        </div>
      </div>
      <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price.toFixed(2) }}</span>
        <span style="font-size:11px;color:#6B7280">{{ p.stock - p.reserved }} {{ p.unit }} {{ t('catalog.dispUnit') }}</span>
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
      :aria-label="'Detalle de ' + detail.name"
      tabindex="-1"
      @click.self="closeDetail"
      @keydown.esc.prevent="closeDetail"
    >
      <div class="card" style="max-width:540px;width:100%;overflow:hidden">
        <div :class="'product-placeholder cat-' + detail.cat" style="height:160px;border-radius:0">
          <div class="pp-icon" style="font-size:40px"><i class="pi pi-box" aria-hidden="true"></i></div>
          <div class="pp-cat">{{ detail.category }}</div>
        </div>
        <div style="padding:20px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px">
            <div>
              <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px">{{ detail.name }}</div>
              <div class="mono" style="font-size:11px;color:#9CA3AF">{{ detail.sku }}</div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="closeDetail" aria-label="Cerrar"><i class="pi pi-times"></i></button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Temperatura</div>
              <div style="font-size:13px;font-weight:500;display:flex;gap:4px;align-items:center">
                <i class="pi pi-thermometer" style="color:#2563EB;font-size:12px"></i> {{ detail.temp }}
              </div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Unidad</div>
              <div style="font-size:13px;font-weight:500">{{ detail.unit }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Stock disponible</div>
              <div style="font-size:15px;font-weight:700">{{ detail.stock - detail.reserved }} <span style="font-size:12px;font-weight:400;color:#6B7280">{{ detail.unit }}</span></div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Precio</div>
              <div style="font-size:16px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif">S/ {{ detail.price.toFixed(2) }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Almacén</div>
              <div style="font-size:13px;font-weight:500">{{ detail.warehouse }} / {{ detail.zone }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Estado</div>
              <span :class="'badge ' + statusBadge(detail.status)">{{ statusLabel(detail.status) }}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost" @click="closeDetail">Cerrar</button>
            <button class="btn btn-primary" @click="router.push('/ops/orders/new'); closeDetail()">
              <i class="pi pi-file-edit"></i> Crear pedido
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
@media (min-width: 1500px) { .catalog-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1900px) { .catalog-grid { grid-template-columns: repeat(6, 1fr); } }
@media (max-width: 1100px) { .catalog-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 800px)  { .catalog-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .catalog-grid { grid-template-columns: 1fr; } }
</style>
