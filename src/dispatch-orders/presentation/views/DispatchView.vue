<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';
import { dispatchApplication } from '@/dispatch-orders/application/dispatch.application';
import { ordersApplication } from '@/purchase-orders/application/orders.application';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const ds = useDataStore();
const D = ds.D;

const podModal = ref({ open: false, dispatch: null });
const podForm = ref({ tempArrival: '', notes: '', photoConfirmed: false, clientSigned: false });

function statusLabel(s) {
  const map = { ready: t('dispatch.status.ready'), in_transit: t('dispatch.status.in_transit'), delivered: t('dispatch.status.delivered') };
  return map[s] || s;
}
function statusBadge(s) {
  return 'badge-' + ({ ready: 'amber', in_transit: 'blue', delivered: 'green' }[s] || 'gray');
}

function markInRoute(d) {
  d.status = 'in_transit';
  const order = D.orders.find(o => o.id === d.orderId);
  if (order) order.status = 'dispatched';
  dispatchApplication.markInRoute(d.id).catch(() => {});
  if (order) ordersApplication.updateOrderStatus(order.id, 'dispatched').catch(() => {});
  toast.add({ severity: 'info', summary: t('dispatch.status.in_transit'), detail: `${d.id} salió hacia ${d.dest}`, life: 3500 });
}

function openPod(d) {
  podModal.value = { open: true, dispatch: d };
  podForm.value = { tempArrival: '', notes: '', photoConfirmed: false, clientSigned: false };
}

function submitPod() {
  const d = podModal.value.dispatch;
  if (!podForm.value.photoConfirmed || !podForm.value.clientSigned) {
    toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Confirma foto y firma del cliente para cerrar', life: 3000 });
    return;
  }
  d.status = 'delivered';
  d.evidenceDone = true;
  d.tempArrival = podForm.value.tempArrival;
  const deliveredOrder = D.orders.find(o => o.id === d.orderId);
  if (deliveredOrder) deliveredOrder.status = 'delivered';
  dispatchApplication.submitProofOfDelivery(d.id, { tempArrival: podForm.value.tempArrival }).catch(() => {});
  if (deliveredOrder) ordersApplication.updateOrderStatus(deliveredOrder.id, 'delivered').catch(() => {});
  podModal.value.open = false;
  toast.add({ severity: 'success', summary: 'Entrega registrada', detail: `${d.id} — POD completado`, life: 3500 });
}
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('nav.dispatch') }}</div>
      <div class="page-subtitle">{{ D.dispatches.length }} {{ t('dispatch.subtitle') }}</div>
    </div>
    <button class="btn btn-secondary" disabled title="Disponible en AV2">
      <i class="pi pi-plus" aria-hidden="true"></i> {{ t('dispatch.schedule') }}
    </button>
  </div>

  <div class="grid-3" style="margin-bottom:20px" role="region" :aria-label="'KPIs despacho'">
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B" aria-hidden="true"></i> {{ t('dispatch.kpi.ready') }}</div>
      <div class="kpi-value" style="color:#F59E0B">{{ D.dispatches.filter(d => d.status === 'ready').length }}</div>
      <div class="kpi-sub">{{ t('dispatch.kpi.readySub') }}</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB" aria-hidden="true"></i> {{ t('dispatch.kpi.transit') }}</div>
      <div class="kpi-value" style="color:#2563EB">{{ D.dispatches.filter(d => d.status === 'in_transit').length }}</div>
      <div class="kpi-sub">{{ t('dispatch.kpi.transitSub') }}</div>
    </div>
    <div class="card kpi-card">
      <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E" aria-hidden="true"></i> {{ t('dispatch.kpi.delivered') }}</div>
      <div class="kpi-value" style="color:#22C55E">{{ D.dispatches.filter(d => d.status === 'delivered').length }}</div>
      <div class="kpi-sub">{{ t('dispatch.kpi.deliveredSub') }}</div>
    </div>
  </div>

  <div class="grid-2">
    <div v-for="d in D.dispatches" :key="d.id" class="card card-pad">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
            <span class="mono" style="font-size:13px;color:#374151">{{ d.id }}</span>
            <span :class="'badge ' + statusBadge(d.status)">{{ statusLabel(d.status) }}</span>
          </div>
          <div style="font-size:13px;font-weight:500">{{ ds.clientName(d.clientId) }}</div>
          <div style="font-size:12px;color:#6B7280">Pedido <span class="mono">{{ d.orderId }}</span></div>
        </div>
        <button class="btn btn-ghost btn-sm" :aria-label="'Opciones'"><i class="pi pi-ellipsis-v" aria-hidden="true"></i></button>
      </div>

      <div class="divider" style="margin:0 0 14px"></div>

      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
        <div style="display:flex;gap:8px"><i class="pi pi-user" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.driver }}</span></div>
        <div style="display:flex;gap:8px"><i class="pi pi-truck" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.vehicle }}</span></div>
        <div style="display:flex;gap:8px"><i class="pi pi-map-marker" style="color:#9CA3AF" aria-hidden="true"></i><span>{{ d.dest }}</span></div>
        <div v-if="d.tempExit" style="display:flex;gap:8px"><i class="pi pi-thermometer" style="color:#2563EB" aria-hidden="true"></i><span class="mono">{{ d.tempExit }}°C salida</span></div>
      </div>

      <div class="divider" style="margin:14px 0"></div>

      <div class="card-title" style="margin-bottom:8px;font-size:12px">{{ t('dispatch.checklist') }}</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div v-for="(c, i) in d.checklist" :key="i" style="display:flex;gap:8px;align-items:center;font-size:12px;color:#374151">
          <i class="pi pi-check-circle" style="color:#22C55E" aria-hidden="true"></i> {{ c }}
        </div>
      </div>

      <div v-if="d.evidenceRequired" style="margin-top:14px" :class="d.evidenceDone ? 'banner banner-success' : 'banner banner-warning'">
        <i :class="d.evidenceDone ? 'pi pi-check' : 'pi pi-camera'" aria-hidden="true"></i>
        <div>{{ d.evidenceDone ? t('dispatch.evidenceDone') : t('dispatch.evidencePending') }}</div>
      </div>

      <div style="display:flex;gap:8px;margin-top:14px">
        <button v-if="d.status === 'ready'" class="btn btn-primary btn-sm" style="flex:1;justify-content:center" @click="markInRoute(d)">
          <i class="pi pi-send" aria-hidden="true"></i> {{ t('dispatch.markInRoute') }}
        </button>
        <button v-if="d.status === 'in_transit'" class="btn btn-success btn-sm" style="flex:1;justify-content:center" @click="openPod(d)">
          <i class="pi pi-check" aria-hidden="true"></i> {{ t('dispatch.confirmDelivery') }}
        </button>
        <button v-if="d.status === 'delivered'" class="btn btn-ghost btn-sm" style="flex:1;justify-content:center" disabled>
          <i class="pi pi-check-circle" aria-hidden="true"></i> {{ t('dispatch.deliveredBtn') }}
        </button>
        <button class="btn btn-ghost btn-sm" @click="router.push('/ops/orders/' + d.orderId)">
          <i class="pi pi-eye" aria-hidden="true"></i> {{ t('dispatch.detail') }}
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="podModal.open"
    style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000"
    role="dialog"
    aria-modal="true"
    :aria-label="'Registro de entrega'"
    tabindex="-1"
    @keydown.esc.prevent="podModal.open = false"
  >
    <div class="card card-pad" style="max-width:480px;width:100%;margin:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div class="card-title">Registro de entrega — {{ podModal.dispatch?.id }}</div>
        <button class="btn btn-ghost btn-sm" @click="podModal.open = false" aria-label="Cerrar modal">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="banner banner-warning" style="margin-bottom:16px">
        <i class="pi pi-info-circle" aria-hidden="true"></i>
        <div>Completa foto y firma para registrar la entrega.</div>
      </div>

      <div class="field" style="margin-bottom:14px">
        <label class="field-label" for="pod-temp">Temperatura de llegada (°C)</label>
        <input
          id="pod-temp"
          class="field-input"
          type="number"
          placeholder="-18.0"
          v-model="podForm.tempArrival"
          step="0.1"
        />
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">
        <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer">
          <input type="checkbox" v-model="podForm.photoConfirmed" />
          Foto del producto entregado capturada
        </label>
        <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer">
          <input type="checkbox" v-model="podForm.clientSigned" />
          Firma del cliente obtenida
        </label>
      </div>

      <div class="field" style="margin-bottom:20px">
        <label class="field-label" for="pod-notes">Notas (opcional)</label>
        <textarea
          id="pod-notes"
          class="field-input"
          v-model="podForm.notes"
          rows="3"
          placeholder="Observaciones de la entrega..."
          style="resize:vertical"
        ></textarea>
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" @click="podModal.open = false">Cancelar</button>
        <button class="btn btn-primary btn-sm" @click="submitPod">
          <i class="pi pi-check" aria-hidden="true"></i> Registrar entrega
        </button>
      </div>
    </div>
  </div>
</template>
