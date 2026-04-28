<script setup>
import { ref, computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';

const ds = useDataStore();
const cart = useCartStore();
const D = ds.D;

const search = ref('');
const filter = ref('Todos');
const filters = ['Todos', ...new Set(D.products.map(p => p.category))];

const filtered = computed(() => {
  let p = D.products.filter(x => x.status !== 'out');
  if (filter.value !== 'Todos') p = p.filter(x => x.category === filter.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    p = p.filter(x => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q));
  }
  return p;
});

const isInCart = (id) => cart.items.some(i => i.productId === id);

const detail = ref(null);

function openDetail(p) { detail.value = p; }
function closeDetail() { detail.value = null; }
function addFromDetail(p) {
  cart.add(p);
  closeDetail();
}
function availabilityLabel(s) {
  return s === 'ok' ? 'Disponible' : s === 'low' ? 'Stock limitado' : 'Agotado';
}
function availabilityBadge(s) {
  return 'badge-' + ({ ok: 'green', low: 'amber', out: 'red' }[s] || 'gray');
}
</script>

<template>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div>
      <div class="page-title">Catálogo</div>
      <div class="page-subtitle">{{ filtered.length }} productos disponibles</div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="search-input"><i class="pi pi-search"></i><input v-model="search" placeholder="Buscar nombre o SKU..." /></div>
    <button v-for="f in filters" :key="f" class="filter-chip" :class="{ active: filter === f }" @click="filter = f">{{ f }}</button>
  </div>

  <div class="grid-4">
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
      <div class="product-placeholder" :class="'cat-' + p.cat" style="height:120px">
        <div class="pp-icon"><i class="pi pi-box"></i></div>
        <div class="pp-cat">{{ p.category }}</div>
      </div>
      <div style="padding:12px;flex:1">
        <div style="font-size:13px;font-weight:600">{{ p.name }}</div>
        <div class="mono" style="font-size:10px;margin-top:4px;margin-bottom:6px">{{ p.sku }}</div>
        <div style="font-size:10px;color:#6B7280;display:flex;align-items:center;gap:3px">
          <i class="pi pi-thermometer" style="font-size:10px"></i> {{ p.temp }}
        </div>
      </div>
      <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price.toFixed(2) }}</span>
        <button
          :class="'add-btn ' + (isInCart(p.id) ? 'add-btn-added' : 'add-btn-default')"
          @click.stop="cart.add(p)"
          :aria-label="isInCart(p.id) ? 'En el carrito' : 'Agregar al carrito'"
        >
          <i :class="isInCart(p.id) ? 'pi pi-check' : 'pi pi-plus'"></i>
        </button>
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
      <div class="card" style="max-width:520px;width:100%;overflow:hidden;animation:slideUp .18s ease">
        <!-- Header image -->
        <div :class="'product-placeholder cat-' + detail.cat" style="height:160px;border-radius:0">
          <div class="pp-icon" style="font-size:40px"><i class="pi pi-box"></i></div>
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
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Precio</div>
              <div style="font-size:16px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif">S/ {{ detail.price.toFixed(2) }}</div>
            </div>
            <div style="background:#F9FAFB;border-radius:8px;padding:10px">
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Disponibilidad</div>
              <span :class="'badge ' + availabilityBadge(detail.status)">{{ availabilityLabel(detail.status) }}</span>
            </div>
          </div>

          <div v-if="detail.status === 'low'" class="banner banner-warning" style="margin-bottom:16px">
            <i class="pi pi-exclamation-triangle"></i>
            <div>Stock limitado. Confirma disponibilidad con tu ejecutivo de cuenta.</div>
          </div>

          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" style="flex:0 0 auto" @click="closeDetail">Cerrar</button>
            <button
              class="btn btn-primary"
              style="flex:1;justify-content:center"
              :disabled="detail.status === 'out' || isInCart(detail.id)"
              @click="addFromDetail(detail)"
            >
              <i :class="isInCart(detail.id) ? 'pi pi-check' : 'pi pi-shopping-cart'"></i>
              {{ isInCart(detail.id) ? 'En el carrito' : 'Agregar al carrito' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
