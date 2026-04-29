<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { orderStatusLabel, orderStatusBadge } from '@/shared/status';

const router = useRouter();
const ds     = useDataStore();
const cart   = useCartStore();
const auth   = useAuthStore();
const D      = ds.D;

const myClient = computed(() => ds.clientById(auth.user?.clientId));
const hasClient = computed(() => Boolean(auth.user?.clientId && myClient.value));
const myOrders = computed(() => {
  const cid = auth.user?.clientId;
  return cid ? D.orders.filter(o => o.clientId === cid) : [];
});

const activeOrders = computed(() =>
  myOrders.value.filter(o => !['delivered','cancelled','rejected'].includes(o.status))
);

const nextDelivery = computed(() => {
  const inRoute = myOrders.value.find(o => o.status === 'dispatched');
  const confirmed = myOrders.value.find(o => o.status === 'confirmed' || o.status === 'preparing');
  const target = inRoute || confirmed;
  if (!target) return null;
  return { id: target.id, date: target.date };
});

const creditAvailable = computed(() => {
  const c = myClient.value;
  if (!c || !c.creditLimit) return null;
  return { available: c.creditLimit - c.creditUsed, limit: c.creditLimit };
});

const featured = D.products.filter(p => p.status === 'ok').slice(0, 4);
const recent   = computed(() => myOrders.value.slice(0, 3));
</script>

<template>
  <div v-if="!hasClient" class="empty-state" style="padding:60px 20px;max-width:560px;margin:0 auto">
    <div class="empty-state-icon"><i class="pi pi-ban"></i></div>
    <div class="empty-state-title">Cuenta B2B sin cliente asociado</div>
    <div class="empty-state-desc">No se pueden mostrar pedidos ni condiciones comerciales sin una cuenta de cliente valida.</div>
  </div>

  <template v-else>
  <div class="portal-hero">
    <div class="hero-greeting">Hola, {{ auth.user?.name?.split(' ')[0] || 'cliente' }}</div>
    <div class="hero-sub">{{ D.company.name }} · Tu distribuidor refrigerado</div>
    <div style="display:flex;gap:10px;position:relative;z-index:1">
      <button class="btn btn-secondary" style="background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.25)" @click="router.push('/portal/catalog')">
        <i class="pi pi-box"></i> Ver catálogo
      </button>
      <button class="btn btn-secondary" style="background:rgba(255,255,255,0.10);color:#fff;border-color:rgba(255,255,255,0.20)" @click="router.push('/portal/orders')">
        <i class="pi pi-clipboard"></i> Mis pedidos
      </button>
    </div>
  </div>

  <div class="grid-3" style="margin-bottom:24px">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-clipboard" style="color:#2563EB"></i> Pedidos activos</div>
      <div class="kpi-value" style="color:#2563EB">{{ activeOrders.length }}</div>
      <div class="kpi-sub">En proceso</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-truck" style="color:#F59E0B"></i> Próxima entrega</div>
      <template v-if="nextDelivery">
        <div class="kpi-value" style="color:#F59E0B;font-size:18px">{{ nextDelivery.date }}</div>
        <div class="kpi-sub">{{ nextDelivery.id }}</div>
      </template>
      <template v-else>
        <div class="kpi-value" style="color:#9CA3AF;font-size:18px">—</div>
        <div class="kpi-sub">Sin envíos activos</div>
      </template>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-wallet" style="color:#22C55E"></i> Crédito disponible</div>
      <template v-if="creditAvailable">
        <div class="kpi-value" :style="{ color: creditAvailable.available <= 0 ? '#EF4444' : '#22C55E' }">
          S/ {{ creditAvailable.available.toLocaleString() }}
        </div>
        <div class="kpi-sub">de S/ {{ creditAvailable.limit.toLocaleString() }}</div>
      </template>
      <template v-else>
        <div class="kpi-value" style="color:#6B7280;font-size:16px">Contado</div>
        <div class="kpi-sub">Sin línea de crédito</div>
      </template>
    </div>
  </div>

  <div class="card-title" style="margin-bottom:12px">Productos destacados</div>
  <div class="grid-4" style="margin-bottom:24px">
    <div v-for="p in featured" :key="p.id" class="card" style="overflow:hidden;display:flex;flex-direction:column;cursor:pointer" @click="router.push('/portal/catalog')">
      <div class="product-placeholder" :class="'cat-' + p.cat">
        <div class="pp-icon"><i class="pi pi-box"></i></div>
        <div class="pp-cat">{{ p.category }}</div>
      </div>
      <div style="padding:12px;flex:1">
        <div style="font-size:13px;font-weight:600">{{ p.name }}</div>
        <div class="mono" style="font-size:10px;margin-top:4px">{{ p.sku }}</div>
      </div>
      <div style="padding:10px 12px;border-top:1px solid #F3F0EC;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700">S/ {{ p.price.toFixed(2) }}</span>
        <button class="add-btn add-btn-default" @click.stop="cart.add(p)"><i class="pi pi-plus"></i></button>
      </div>
    </div>
  </div>

  <div class="card-title" style="margin-bottom:12px">Pedidos recientes</div>
  <div class="card" style="overflow:hidden">
    <div v-if="!recent.length" style="padding:32px;text-align:center;color:#9CA3AF;font-size:13px">
      Sin pedidos registrados aún
    </div>
    <table v-else class="data-table">
      <thead><tr><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>
        <tr v-for="o in recent" :key="o.id" style="cursor:pointer" @click="router.push('/portal/orders')">
          <td><span class="mono">{{ o.id }}</span></td>
          <td style="font-size:12px;color:#6B7280">{{ o.date }}</td>
          <td style="font-weight:600">S/ {{ o.total.toFixed(2) }}</td>
          <td><span :class="'badge ' + orderStatusBadge(o.status)">{{ orderStatusLabel(o.status) }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  </template>
</template>
