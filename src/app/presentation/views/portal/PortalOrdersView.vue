<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { ORDER_STATUS_FLOW, orderStatusLabel, orderStatusBadge, orderStepState } from '@/shared/status';

const ds   = useDataStore();
const auth = useAuthStore();
const D    = ds.D;

const hasClient = computed(() => Boolean(auth.user?.clientId && ds.clientById(auth.user?.clientId)));
const myOrders = computed(() => {
  const cid = auth.user?.clientId;
  const all = D.orders;
  return cid ? all.filter(o => o.clientId === cid) : [];
});

const trackingSteps = (status) => ORDER_STATUS_FLOW.map((key, i, arr) => ({
  key,
  label: key === 'dispatched' ? 'En ruta' : orderStatusLabel(key),
  state: orderStepState(status, key),
  last: i === arr.length - 1,
}));
</script>

<template>
  <div style="margin-bottom:16px">
    <div class="page-title">Mis pedidos</div>
    <div class="page-subtitle">{{ myOrders.length }} pedido(s) en el período</div>
  </div>

  <div v-if="!hasClient" style="text-align:center;padding:60px 20px">
    <div style="font-size:40px;margin-bottom:16px"><i class="pi pi-ban" style="color:#D1D5DB"></i></div>
    <div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:6px">Cuenta B2B sin cliente asociado</div>
    <div style="font-size:13px;color:#9CA3AF">No se pueden mostrar pedidos sin una cuenta de cliente valida.</div>
  </div>

  <div v-else-if="!myOrders.length" style="text-align:center;padding:60px 20px">
    <div style="font-size:40px;margin-bottom:16px"><i class="pi pi-clipboard" style="color:#D1D5DB"></i></div>
    <div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:6px">Sin pedidos aún</div>
    <div style="font-size:13px;color:#9CA3AF">Agrega productos al carrito para realizar tu primer pedido</div>
  </div>

  <div v-else style="display:flex;flex-direction:column;gap:16px">
    <div v-for="o in myOrders" :key="o.id" class="card card-pad">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
            <span class="mono" style="font-size:13px;color:#374151">{{ o.id }}</span>
            <span :class="'badge ' + orderStatusBadge(o.status)">{{ orderStatusLabel(o.status) }}</span>
          </div>
          <div style="font-size:12px;color:#6B7280">{{ o.date }} · {{ o.items.length }} ítem(s)</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:700">S/ {{ o.total.toFixed(2) }}</div>
        </div>
      </div>

      <!-- Tracking bar -->
      <div style="display:flex;align-items:flex-start;padding:8px 0">
        <template v-for="(step, i) in trackingSteps(o.status)" :key="step.key">
          <div :class="'os-step os-' + step.state" style="display:flex;flex-direction:column;align-items:center;flex:1;gap:6px">
            <div :style="{
              width: '30px', height: '30px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px',
              background: step.state === 'done' ? '#22C55E' : step.state === 'active' ? '#2563EB' : '#E5E7EB',
              color: step.state === 'pending' ? '#6B7280' : '#fff',
              boxShadow: step.state === 'active' ? '0 0 0 4px #DBEAFE' : 'none',
            }">
              <i v-if="step.state === 'done'" class="pi pi-check"></i>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div :style="{ fontSize: '10px', fontWeight: step.state === 'active' ? 600 : 500, color: step.state === 'done' ? '#15803D' : step.state === 'active' ? '#1D4ED8' : '#9CA3AF', textAlign: 'center' }">
              {{ step.label }}
            </div>
          </div>
          <div v-if="!step.last" :style="{
            height: '2px', flex: 1, marginTop: '15px',
            background: step.state === 'done' ? '#22C55E' : '#E5E7EB',
          }"></div>
        </template>
      </div>

      <div v-if="o.notes" class="banner banner-warning" style="margin-top:14px;margin-bottom:0">
        <i class="pi pi-info-circle"></i><div>{{ o.notes }}</div>
      </div>
    </div>
  </div>
</template>
