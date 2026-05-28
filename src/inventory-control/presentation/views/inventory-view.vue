<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDataStore } from '@/app/application/stores/data.store';
import { daysUntil } from '@/shared/status';

const { t } = useI18n();
const ds = useDataStore();
const D = ds.D;
const tab = ref('overview');

const lotDrawer = ref({ open: false, lot: null });
const currentTimeLabel = computed(() => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()));

function openLot(lot) { lotDrawer.value = { open: true, lot }; }
function closeLot() { lotDrawer.value.open = false; }

const lotMovements = computed(() => {
  if (!lotDrawer.value.lot) return [];
  return D.movements.filter(m => m.lotId === lotDrawer.value.lot.id);
});
const stockSearch = ref('');
const stockFilter = ref('all');
const movementFilter = ref('all');

const filteredStock = computed(() => {
  let p = D.products;
  if (stockFilter.value !== 'all') p = p.filter(x => x.status === stockFilter.value);
  if (stockSearch.value) {
    const q = stockSearch.value.toLowerCase();
    p = p.filter(x => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q));
  }
  return p;
});
const sortedLots   = computed(() => [...D.lots].sort((a, b) => new Date(a.expiry) - new Date(b.expiry)));
const expiringLots = computed(() => D.lots.filter(l => daysUntil(l.expiry) <= 10));
const urgentLot    = computed(() => sortedLots.value.find(l => daysUntil(l.expiry) <= 10));
const lowStockProducts = computed(() =>
  D.products.filter(product => product.status === 'low' || product.stock - product.reserved < product.minStock)
);
const reservationRate = computed(() => {
  const totalStock = D.products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const reserved = D.products.reduce((sum, product) => sum + Number(product.reserved || 0), 0);
  return totalStock ? Math.round((reserved / totalStock) * 100) : 0;
});

function stockStatusLabel(s) {
  return s === 'ok' ? t('inventory.stockOk') : s === 'low' ? t('inventory.stockLow') : t('inventory.stockOut');
}

function movementTypeLabel(type) {
  return {
    ingreso: 'Inbound',
    salida: 'Outbound',
    reserva: 'Reservation',
    ajuste: 'Adjustment',
}[type] || type;
}
const filteredMovements = computed(() => {
  if (movementFilter.value === 'all') return D.movements;
  return D.movements.filter(movement => movement.type === movementFilter.value);
});
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.inventory') }}</div>
      <div class="page-subtitle">{{ D.company.name }} · {{ t('inventory.subtitle') }} {{ currentTimeLabel }}</div>
    </div>
    <button class="btn btn-secondary" disabled title="Available in AV2">
      <i class="pi pi-plus" aria-hidden="true"></i> {{ t('inventory.registerMovement') }}
    </button>
  </div>

  <div class="banner banner-danger" v-if="expiringLots.length" role="alert">
    <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
    <div><strong>{{ expiringLots.length }} lot(s) due soon</strong> —
      {{ expiringLots.map(l => ds.productName(l.productId) + ' (' + l.id + ')').join(' · ') }}.
      Prioritize release according to FEFO.
    </div>
  </div>

  <div class="grid-3" style="margin-bottom:18px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-lock" style="color:#2563EB"></i> Reserved stock</div>
      <div class="kpi-value" style="color:#2563EB">{{ reservationRate }}%</div>
      <div class="kpi-sub">Reserved across current catalog</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-exclamation-triangle" style="color:#F97316"></i> Low stock</div>
      <div class="kpi-value" style="color:#F97316">{{ lowStockProducts.length }}</div>
      <div class="kpi-sub">Products below minimum or marked low</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-hourglass" style="color:#B91C1C"></i> FEFO risk</div>
      <div class="kpi-value" style="color:#B91C1C">{{ expiringLots.length }}</div>
      <div class="kpi-sub">Lots due in 10 days or less</div>
    </div>
  </div>

  <!-- Tabs -->
  <div style="display:flex;gap:2px;background:#F3F0EC;border-radius:10px;padding:4px;margin-bottom:20px;width:fit-content" role="tablist">
    <button
      class="btn btn-ghost btn-sm"
      :style="{background: tab==='overview'?'#fff':'transparent', boxShadow: tab==='overview'?'0 1px 3px rgba(0,0,0,0.06)':'none', border: 'none'}"
      @click="tab='overview'"
      role="tab"
      :aria-selected="tab === 'overview'"
    >{{ t('inventory.tabs.overview') }}</button>
    <button
      class="btn btn-ghost btn-sm"
      :style="{background: tab==='lots'?'#fff':'transparent', boxShadow: tab==='lots'?'0 1px 3px rgba(0,0,0,0.06)':'none', border: 'none'}"
      @click="tab='lots'"
      role="tab"
      :aria-selected="tab === 'lots'"
    >{{ t('inventory.tabs.lots') }}</button>
    <button
      class="btn btn-ghost btn-sm"
      :style="{background: tab==='movements'?'#fff':'transparent', boxShadow: tab==='movements'?'0 1px 3px rgba(0,0,0,0.06)':'none', border: 'none'}"
      @click="tab='movements'"
      role="tab"
      :aria-selected="tab === 'movements'"
    >{{ t('inventory.tabs.movements') }}</button>
  </div>

  <!-- OVERVIEW -->
  <div v-if="tab === 'overview'" role="tabpanel">
    <div style="margin-bottom:20px">
      <div class="section-label">{{ t('inventory.warehouses') }}</div>
      <div class="grid-2">
        <div v-for="wh in D.warehouses" :key="wh.id">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <i class="pi pi-building" style="color:#9CA3AF" aria-hidden="true"></i> {{ wh.name }}
            <span style="font-size:11px;color:#9CA3AF;font-weight:400">· {{ wh.address }}</span>
          </div>
          <div class="grid-2" style="gap:10px">
            <div v-for="z in wh.zones" :key="z.id" class="card card-pad">
              <div style="display:flex;justify-content:space-between;margin-bottom:12px">
                <div>
                  <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600">{{ z.name }}</div>
                  <div class="mono" style="font-size:11px">{{ z.temp }}</div>
                </div>
                <span class="badge badge-green"><i class="pi pi-check" style="font-size:9px" aria-hidden="true"></i> {{ t('inventory.tempOk') }}</span>
              </div>
              <div
                style="height:6px;background:#F3F0EC;border-radius:9999px;margin-bottom:6px;overflow:hidden"
                role="progressbar"
                :aria-valuenow="Math.round(z.used / z.capacity * 100)"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div :style="{ width: Math.round(z.used / z.capacity * 100) + '%', height: '100%', borderRadius: '9999px', background: z.used / z.capacity >= 0.9 ? '#EF4444' : z.used / z.capacity >= 0.75 ? '#F97316' : '#22C55E' }"></div>
              </div>
              <div style="font-size:11px;color:#6B7280;display:flex;justify-content:space-between">
                <span>{{ z.used }} m³ used</span>
                <span>{{ z.capacity }} m³ total ({{ Math.round(z.used / z.capacity * 100) }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <span class="card-title">{{ t('inventory.stockByProduct') }}</span>
        <div class="filter-bar" style="margin-bottom:0">
          <div class="search-input" style="min-width:180px">
            <i class="pi pi-search" aria-hidden="true"></i>
            <input v-model="stockSearch" :placeholder="t('common.search')" :aria-label="t('common.search')" />
          </div>
          <button v-for="f in ['all','ok','low','out']" :key="f" class="filter-chip" :class="{ active: stockFilter === f }" @click="stockFilter = f" :aria-pressed="stockFilter === f" style="font-size:11px;padding:5px 10px">
            {{ f === 'all' ? t('common.all') : f === 'ok' ? 'OK' : f === 'low' ? t('inventory.stockLow') : t('inventory.stockOut') }}
          </button>
        </div>
      </div>
      <table class="data-table" role="table" :aria-label="t('inventory.stockByProduct')">
        <thead>
          <tr>
            <th scope="col">{{ t('inventory.table.product') }}</th>
            <th scope="col">{{ t('inventory.table.sku') }}</th>
            <th scope="col">{{ t('inventory.table.category') }}</th>
            <th scope="col">{{ t('inventory.table.temp') }}</th>
            <th scope="col">{{ t('inventory.table.stock') }}</th>
            <th scope="col">{{ t('inventory.table.reserved') }}</th>
            <th scope="col">{{ t('inventory.table.available') }}</th>
            <th scope="col">{{ t('inventory.table.minimum') }}</th>
            <th scope="col">{{ t('inventory.table.warehouse') }}</th>
            <th scope="col">{{ t('inventory.table.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredStock" :key="p.id">
            <td style="font-weight:500;font-size:13px">{{ p.name }}</td>
            <td><span class="mono">{{ p.sku }}</span></td>
            <td style="font-size:12px;color:#6B7280">{{ p.category }}</td>
            <td><span class="badge-temp" style="font-size:10px">{{ p.temp }}</span></td>
            <td style="font-weight:600">{{ p.stock }} <span style="font-size:11px;color:#9CA3AF">{{ p.unit }}</span></td>
            <td><span :style="{ color: p.reserved > 0 ? '#2563EB' : '#9CA3AF', fontWeight: p.reserved > 0 ? '600' : '400' }">{{ p.reserved }} {{ p.unit }}</span></td>
            <td><span :style="{ fontWeight: '600', color: p.stock - p.reserved <= 0 ? '#B91C1C' : p.stock - p.reserved < p.minStock ? '#C2410C' : '#15803D' }">{{ p.stock - p.reserved }} {{ p.unit }}</span></td>
            <td style="font-size:12px;color:#6B7280">{{ p.minStock }} {{ p.unit }}</td>
            <td style="font-size:12px;color:#6B7280">{{ p.warehouse }}</td>
            <td><span :class="'badge ' + (p.status === 'ok' ? 'badge-green' : p.status === 'low' ? 'badge-amber' : 'badge-red')">{{ stockStatusLabel(p.status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- LOTS -->
  <div v-if="tab === 'lots'" role="tabpanel">
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;display:flex;align-items:center;gap:5px">
        <i class="pi pi-sort-amount-up" aria-hidden="true"></i> {{ t('inventory.fefoTitle') }}
      </div>
      <div style="font-size:14px;font-weight:600;color:#1E3A8A;margin-bottom:5px" v-if="urgentLot">
        Prioritize outbound stock for {{ ds.productName(urgentLot.productId) }}
      </div>
      <div style="font-size:12px;color:#3B4E6B;line-height:1.5" v-if="urgentLot">
        Lot <strong>{{ urgentLot.id }}</strong> is due on <strong>{{ urgentLot.expiry }}</strong>. {{ urgentLot.qty - urgentLot.reserved }} {{ ds.productById(urgentLot.productId)?.unit }} remain available.
      </div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <span class="card-title">{{ t('inventory.lotsByExpiry') }}</span>
        <span style="font-size:12px;color:#6B7280">{{ t('inventory.fefoDesc') }}</span>
      </div>
      <table class="data-table" role="table" :aria-label="t('inventory.lotsByExpiry')">
        <thead>
          <tr>
            <th scope="col">{{ t('inventory.table.lot') }}</th>
            <th scope="col">{{ t('inventory.table.product') }}</th>
            <th scope="col">{{ t('inventory.table.entry') }}</th>
            <th scope="col">{{ t('inventory.table.expiry') }}</th>
            <th scope="col">{{ t('inventory.table.days') }}</th>
            <th scope="col">{{ t('inventory.table.stock') }}</th>
            <th scope="col">{{ t('inventory.table.reserved') }}</th>
            <th scope="col">{{ t('inventory.table.available') }}</th>
            <th scope="col">{{ t('inventory.table.warehouse') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="lot in sortedLots"
            :key="lot.id"
            style="cursor:pointer"
            role="button"
            tabindex="0"
            @click="openLot(lot)"
            @keydown.enter.prevent="openLot(lot)"
            @keydown.space.prevent="openLot(lot)"
          >
            <td><span class="mono">{{ lot.id }}</span></td>
            <td style="font-size:13px;font-weight:500">{{ ds.productName(lot.productId) }}</td>
            <td style="font-size:12px;color:#6B7280">{{ lot.entryDate }}</td>
            <td style="font-size:13px" :style="{ color: daysUntil(lot.expiry) <= 7 ? '#B91C1C' : daysUntil(lot.expiry) <= 30 ? '#B45309' : '' }">{{ lot.expiry }}</td>
            <td>
              <span :class="daysUntil(lot.expiry) <= 7 ? 'badge badge-red' : daysUntil(lot.expiry) <= 30 ? 'badge badge-amber' : 'badge badge-green'">{{ daysUntil(lot.expiry) }} days</span>
            </td>
            <td style="font-weight:600">{{ lot.qty }} {{ ds.productById(lot.productId)?.unit }}</td>
            <td style="color:#2563EB">{{ lot.reserved }} {{ ds.productById(lot.productId)?.unit }}</td>
            <td style="font-weight:600;color:#15803D">{{ lot.qty - lot.reserved }} {{ ds.productById(lot.productId)?.unit }}</td>
            <td style="font-size:12px;color:#6B7280">{{ lot.warehouse }} / {{ lot.zone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MOVEMENTS -->
  <div v-if="tab === 'movements'" class="card" style="overflow:hidden" role="tabpanel">
    <div class="card-header">
      <span class="card-title">{{ t('inventory.stockMovements') }}</span>
      <div class="filter-bar" style="margin-bottom:0">
        <button v-for="type in ['all','ingreso','salida','reserva','ajuste']" :key="type" class="filter-chip" :class="{ active: movementFilter === type }" @click="movementFilter = type">
          {{ type === 'all' ? 'All movements' : movementTypeLabel(type) }}
        </button>
        <button class="btn btn-secondary btn-sm" disabled title="Available in AV2">
          <i class="pi pi-plus" aria-hidden="true"></i> {{ t('inventory.register') }}
        </button>
      </div>
    </div>
    <table class="data-table" role="table" :aria-label="t('inventory.stockMovements')">
      <thead>
        <tr>
          <th scope="col">{{ t('inventory.table.date') }}</th>
          <th scope="col">{{ t('inventory.table.type') }}</th>
          <th scope="col">{{ t('inventory.table.product') }}</th>
          <th scope="col">{{ t('inventory.table.lot') }}</th>
          <th scope="col">{{ t('inventory.table.qty') }}</th>
          <th scope="col">{{ t('inventory.table.order') }}</th>
          <th scope="col">{{ t('inventory.table.note') }}</th>
          <th scope="col">{{ t('inventory.table.user') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filteredMovements" :key="m.id">
          <td style="font-size:12px;color:#6B7280;white-space:nowrap">{{ m.date }}</td>
          <td>
            <span :style="{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              background: m.type === 'ingreso' ? '#DCFCE7' : m.type === 'salida' ? '#FEE2E2' : m.type === 'reserva' ? '#DBEAFE' : '#FEF3C7',
              color:      m.type === 'ingreso' ? '#15803D' : m.type === 'salida' ? '#B91C1C' : m.type === 'reserva' ? '#1D4ED8' : '#B45309',
            }">{{ movementTypeLabel(m.type) }}</span>
          </td>
          <td style="font-size:13px;font-weight:500">{{ ds.productName(m.productId) }}</td>
          <td><span class="mono">{{ m.lotId }}</span></td>
          <td><span :style="{ fontWeight: '600', color: m.qty > 0 ? '#15803D' : '#B91C1C' }">{{ m.qty > 0 ? '+' : '' }}{{ m.qty }} {{ ds.productById(m.productId)?.unit }}</span></td>
          <td><span class="mono" v-if="m.orderId">{{ m.orderId }}</span><span v-else style="color:#9CA3AF">—</span></td>
          <td style="font-size:12px;color:#6B7280;max-width:200px">{{ m.note || '—' }}</td>
          <td style="font-size:12px;color:#6B7280">{{ m.user }}</td>
        </tr>
        <tr v-if="!filteredMovements.length">
          <td colspan="8">
            <div class="empty-state" style="padding:24px">
              <div class="empty-state-icon"><i class="pi pi-filter"></i></div>
              <div class="empty-state-title">No stock movements for this filter</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Lot detail drawer -->
  <transition name="fade">
    <div
      v-if="lotDrawer.open"
      class="drawer-overlay"
      @click.self="closeLot"
      aria-hidden="true"
    ></div>
  </transition>
  <aside
    v-if="lotDrawer.open"
    class="drawer"
    :class="{ open: lotDrawer.open }"
    role="dialog"
    aria-modal="true"
    aria-label="Lot Details"
  >
    <div class="drawer-header">
      <div class="drawer-title">
        <span class="mono">{{ lotDrawer.lot?.id }}</span>
      </div>
      <button class="btn btn-ghost btn-sm" @click="closeLot" aria-label="Close">
        <i class="pi pi-times"></i>
      </button>
    </div>
    <div class="drawer-body" v-if="lotDrawer.lot">
      <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:4px">
        {{ ds.productName(lotDrawer.lot.productId) }}
      </div>
      <div class="mono" style="font-size:11px;color:#9CA3AF;margin-bottom:16px">
        {{ ds.productById(lotDrawer.lot.productId)?.sku }}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:#F9FAFB;border-radius:8px;padding:10px">
          <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:4px">Inbound</div>
          <div style="font-size:13px;font-weight:500">{{ lotDrawer.lot.entryDate }}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:8px;padding:10px">
          <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:4px">Expiration</div>
          <div style="font-size:13px;font-weight:500" :style="{ color: daysUntil(lotDrawer.lot.expiry) <= 7 ? '#B91C1C' : daysUntil(lotDrawer.lot.expiry) <= 30 ? '#B45309' : '#111827' }">
            {{ lotDrawer.lot.expiry }}
            <span style="font-size:11px;margin-left:4px">({{ daysUntil(lotDrawer.lot.expiry) }} days)</span>
          </div>
        </div>
        <div style="background:#F9FAFB;border-radius:8px;padding:10px">
          <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:4px">Qty total</div>
          <div style="font-size:15px;font-weight:700">{{ lotDrawer.lot.qty }} {{ ds.productById(lotDrawer.lot.productId)?.unit }}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:8px;padding:10px">
          <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:4px">Available</div>
          <div style="font-size:15px;font-weight:700;color:#15803D">{{ lotDrawer.lot.qty - lotDrawer.lot.reserved }} {{ ds.productById(lotDrawer.lot.productId)?.unit }}</div>
        </div>
      </div>

      <div style="font-size:12px;color:#6B7280;margin-bottom:6px">
        <i class="pi pi-building" style="font-size:11px"></i>
        {{ lotDrawer.lot.warehouse }} / {{ lotDrawer.lot.zone }}
      </div>

      <div class="divider" style="margin:16px 0"></div>

      <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">
        Registered Movements
      </div>

      <div v-if="!lotMovements.length" style="font-size:12px;color:#9CA3AF;text-align:center;padding:20px 0">
        No movements for this lot
      </div>
      <div v-for="m in lotMovements" :key="m.id" style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #F3F0EC;align-items:flex-start">
        <span :style="{
          padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', flexShrink: 0, marginTop: '2px',
          background: m.type === 'ingreso' ? '#DCFCE7' : m.type === 'salida' ? '#FEE2E2' : m.type === 'reserva' ? '#DBEAFE' : '#FEF3C7',
          color:      m.type === 'ingreso' ? '#15803D' : m.type === 'salida' ? '#B91C1C' : m.type === 'reserva' ? '#1D4ED8' : '#B45309',
        }">{{ movementTypeLabel(m.type) }}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;color:#374151">{{ m.qty > 0 ? '+' : '' }}{{ m.qty }} {{ ds.productById(m.productId)?.unit }}</div>
          <div style="font-size:11px;color:#9CA3AF">{{ m.date }} · {{ m.user }}</div>
          <div v-if="m.note" style="font-size:11px;color:#6B7280;margin-top:2px">{{ m.note }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>
