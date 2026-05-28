<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';

const { t } = useI18n();
const ds = useDataStore();
const D = ds.D;

const detail = ref(null);
function openClient(c) { detail.value = c; }
function closeClient() { detail.value = null; }

function creditPercent(c) {
  if (!c.creditLimit) return 0;
  return Math.min(100, Math.round(c.creditUsed / c.creditLimit * 100));
}
function creditColor(c) {
  const p = creditPercent(c);
  return p >= 100 ? '#EF4444' : p >= 80 ? '#F97316' : '#22C55E';
}
const clientOrders = (id) => D.orders.filter(o => o.clientId === id);
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.clients') }}</div>
      <div class="page-subtitle">{{ D.clients.length }} {{ t('clients.subtitle') }}</div>
    </div>
    <button class="btn btn-secondary" disabled title="Available in AV2">
      <i class="pi pi-plus" aria-hidden="true"></i> {{ t('clients.newClient') }}
    </button>
  </div>

  <div class="card" style="overflow:hidden">
    <table class="data-table" role="table" :aria-label="t('nav.clients')">
      <thead>
        <tr>
          <th scope="col">{{ t('clients.table.client') }}</th>
          <th scope="col">{{ t('clients.table.ruc') }}</th>
          <th scope="col">{{ t('clients.table.type') }}</th>
          <th scope="col">{{ t('clients.table.condition') }}</th>
          <th scope="col">{{ t('clients.table.credit') }}</th>
          <th scope="col">{{ t('clients.table.status') }}</th>
          <th scope="col">{{ t('clients.table.lastOrder') }}</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="c in D.clients"
          :key="c.id"
          style="cursor:pointer"
          role="button"
          tabindex="0"
          @click="openClient(c)"
          @keydown.enter.prevent="openClient(c)"
          @keydown.space.prevent="openClient(c)"
        >
          <td>
            <div style="font-weight:500;font-size:13px">{{ c.name }}</div>
            <div style="font-size:11px;color:#9CA3AF">{{ c.contact }} · {{ c.phone }}</div>
          </td>
          <td><span class="mono">{{ c.ruc }}</span></td>
          <td style="font-size:12px;color:#6B7280">{{ c.type }}</td>
          <td style="font-size:12px">{{ c.condition }}</td>
          <td style="min-width:140px">
            <template v-if="c.creditLimit">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:3px">
                <span>S/ {{ c.creditUsed.toLocaleString() }}</span>
                <span>S/ {{ c.creditLimit.toLocaleString() }}</span>
              </div>
              <div class="credit-bar-wrap" role="progressbar" :aria-valuenow="creditPercent(c)" aria-valuemin="0" aria-valuemax="100">
                <div class="credit-bar" :style="{ width: creditPercent(c) + '%', background: creditColor(c) }"></div>
              </div>
            </template>
            <span v-else style="font-size:12px;color:#9CA3AF">{{ t('clients.cash') }}</span>
          </td>
          <td>
            <span :class="'badge ' + (c.status === 'active' ? 'badge-green' : 'badge-orange')">
              {{ c.status === 'active' ? t('clients.active') : t('clients.observed') }}
            </span>
          </td>
          <td style="font-size:12px;color:#6B7280">{{ c.lastOrder }}</td>
          <td>
            <button class="btn btn-ghost btn-sm" @click.stop="openClient(c)">{{ t('clients.viewProfile') }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Client detail drawer -->
  <transition name="fade">
    <div v-if="detail" class="drawer-overlay" @click.self="closeClient" aria-hidden="true"></div>
  </transition>
  <aside
    v-if="detail"
    class="drawer"
    :class="{ open: !!detail }"
    role="dialog"
    aria-modal="true"
    aria-label="Client Profile"
  >
    <div class="drawer-header">
      <div class="drawer-title">Client Profile</div>
      <button class="btn btn-ghost btn-sm" @click="closeClient" aria-label="Close"><i class="pi pi-times"></i></button>
    </div>
    <div class="drawer-body" v-if="detail">
      <!-- Header info -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:44px;height:44px;border-radius:50%;background:#DBEAFE;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#1D4ED8;flex-shrink:0">
          {{ detail.name.charAt(0) }}
        </div>
        <div>
          <div style="font-size:15px;font-weight:700;color:#111827">{{ detail.name }}</div>
          <div style="font-size:12px;color:#6B7280">{{ detail.type }}</div>
        </div>
        <span :class="'badge ' + (detail.status === 'active' ? 'badge-green' : 'badge-orange')" style="margin-left:auto">
          {{ detail.status === 'active' ? t('clients.active') : t('clients.observed') }}
        </span>
      </div>

      <!-- Contact -->
      <div class="card card-pad" style="margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Contact</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;gap:8px;align-items:center"><i class="pi pi-user" style="color:#9CA3AF;font-size:12px"></i> {{ detail.contact }}</div>
          <div style="display:flex;gap:8px;align-items:center"><i class="pi pi-phone" style="color:#9CA3AF;font-size:12px"></i> {{ detail.phone }}</div>
          <div style="display:flex;gap:8px;align-items:center"><i class="pi pi-map-marker" style="color:#9CA3AF;font-size:12px"></i> {{ detail.address }}</div>
          <div style="display:flex;gap:8px;align-items:center"><i class="pi pi-id-card" style="color:#9CA3AF;font-size:12px"></i><span class="mono">{{ detail.ruc }}</span></div>
        </div>
      </div>

      <!-- Commercial -->
      <div class="card card-pad" style="margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Commercial Conditions</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
          <span style="color:#6B7280">Payment Condition</span>
          <span style="font-weight:600">{{ detail.condition }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
          <span style="color:#6B7280">Last Purchase Order</span>
          <span style="font-weight:500">{{ detail.lastOrder }}</span>
        </div>
        <template v-if="detail.creditLimit">
          <div class="divider" style="margin:10px 0"></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:4px">
            <span>Used: S/ {{ detail.creditUsed.toLocaleString() }}</span>
            <span>Limit: S/ {{ detail.creditLimit.toLocaleString() }}</span>
          </div>
          <div class="credit-bar-wrap" style="margin-bottom:6px">
            <div class="credit-bar" :style="{ width: creditPercent(detail) + '%', background: creditColor(detail) }"></div>
          </div>
          <div style="text-align:right;font-size:11px;color:#6B7280">{{ creditPercent(detail) }}% used</div>
          <div v-if="detail.creditUsed >= detail.creditLimit" class="banner banner-danger" style="margin-top:8px">
            <i class="pi pi-times-circle"></i>
            <div>Credit exhausted. Purchase orders will remain blocked.</div>
          </div>
        </template>
        <template v-else>
          <div class="divider" style="margin:10px 0"></div>
          <div style="font-size:12px;color:#6B7280"><i class="pi pi-credit-card"></i> Cash client</div>
        </template>
      </div>

      <!-- Recent orders -->
      <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">
        Purchase Orders recientes
      </div>
      <div v-if="!clientOrders(detail.id).length" style="font-size:12px;color:#9CA3AF;text-align:center;padding:16px 0">
        No purchase orders registered
      </div>
      <div
        v-for="o in clientOrders(detail.id).slice(0, 5)"
        :key="o.id"
        style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F3F0EC;font-size:12px"
      >
        <span class="mono" style="color:#374151">{{ o.id }}</span>
        <span style="color:#6B7280">{{ o.date }}</span>
        <span style="font-weight:600">S/ {{ o.total.toFixed(2) }}</span>
      </div>
    </div>
  </aside>
</template>
