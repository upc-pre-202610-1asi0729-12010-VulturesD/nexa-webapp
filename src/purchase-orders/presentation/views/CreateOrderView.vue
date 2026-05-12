<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';

const router = useRouter();
const toast = useToast();
const ds = useDataStore();
const auth = useAuthStore();
const D = ds.D;

const step = ref(1);
const steps = ['Cliente', 'Productos', 'Entrega', 'Confirmar'];
const selectedClient = ref(null);
const lines = ref([]);
const delivery = ref({ date: tomorrowISO(), address: '', notes: '', priority: 'medium' });

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function pickClient(c) {
  selectedClient.value = c;
  delivery.value.address = c.address;
}
function proceedToProducts() {
  if (!selectedClient.value || isCreditBlocked.value) return;
  step.value = 2;
}
const isCreditBlocked = computed(() => {
  const c = selectedClient.value;
  return !!c?.creditLimit && c.creditUsed >= c.creditLimit;
});
function creditPercent(c) {
  if (!c.creditLimit) return 0;
  return Math.min(100, Math.round(c.creditUsed / c.creditLimit * 100));
}
function creditColor(c) {
  const pct = creditPercent(c);
  return pct >= 100 ? '#EF4444' : pct >= 80 ? '#F97316' : '#22C55E';
}
function addLine(p) {
  const max = Math.max(0, p.stock - p.reserved);
  if (!max) return;
  const existing = lines.value.find(l => l.productId === p.id);
  if (existing) existing.qty = Math.min(existing.qty + 1, existing.max);
  else lines.value.push({ productId: p.id, qty: 1, price: p.price, name: p.name, unit: p.unit, max });
}
function removeLine(id) { lines.value = lines.value.filter(l => l.productId !== id); }
const total = computed(() => lines.value.reduce((s, l) => s + l.price * l.qty, 0));
const hasInvalidLines = computed(() => lines.value.some(l => !l.qty || l.qty < 1 || l.qty > l.max));
function confirm() {
  if (!selectedClient.value || !lines.value.length || hasInvalidLines.value) return;
  const newId = ds.nextOrderId();
  const today = new Date().toISOString().slice(0, 10);
  ds.addOrder({
    id:       newId,
    clientId: selectedClient.value.id,
    status:   'validating',
    priority: delivery.value.priority,
    date:     today,
    items:    lines.value.map(l => ({
      productId: l.productId,
      qty:       l.qty,
      price:     l.price,
      stockOk:   l.qty <= l.max,
    })),
    total:  total.value,
    notes:  delivery.value.notes || '',
    source: 'assisted_order',
    createdBy: auth.user?.id || null,
    createdByName: auth.user?.name || '',
    createdByRole: auth.user?.roleName || '',
    createdByRoleKey: auth.user?.roleKey || '',
  });
  toast.add({ severity: 'success', summary: 'Pedido creado', detail: `${newId} — en validación`, life: 3500 });
  router.push(`/ops/orders/${newId}`);
}
</script>

<template>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn btn-ghost btn-sm" @click="router.push('/ops/orders')"><i class="pi pi-arrow-left"></i> Pedidos</button>
    <div style="flex:1">
      <div class="page-title">Crear pedido</div>
      <div class="page-subtitle">{{ D.company.name }}</div>
    </div>
  </div>

  <!-- Stepper -->
  <div class="stepper">
    <template v-for="(s, idx) in steps" :key="s">
      <div class="step-item" :class="step === idx + 1 ? 'step-active' : step > idx + 1 ? 'step-done' : 'step-pending'">
        <div class="step-circle"><i v-if="step > idx + 1" class="pi pi-check"></i><span v-else>{{ idx + 1 }}</span></div>
        <div class="step-label">{{ s }}</div>
      </div>
      <div v-if="idx < steps.length - 1" class="step-connector" :class="step > idx + 1 ? 'step-connector-done' : 'step-connector-pending'"></div>
    </template>
  </div>

  <!-- STEP 1: Client -->
  <div v-if="step === 1">
    <div class="card-title" style="margin-bottom:12px">Selecciona el cliente</div>
    <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start">
      <div class="grid-1" style="display:flex;flex-direction:column;gap:10px">
        <div
          v-for="c in D.clients"
          :key="c.id"
          class="card card-pad"
          style="cursor:pointer;transition:box-shadow .15s"
          :style="selectedClient?.id === c.id ? 'box-shadow:0 0 0 2px #2563EB;' : ''"
          @click="pickClient(c)"
        >
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                <div style="font-weight:600;font-size:14px">{{ c.name }}</div>
                <i v-if="selectedClient?.id === c.id" class="pi pi-check-circle" style="color:#2563EB;font-size:14px"></i>
              </div>
              <div style="font-size:12px;color:#6B7280;margin-top:4px">{{ c.contact }} · {{ c.phone }}</div>
              <div style="font-size:11px;color:#9CA3AF;margin-top:6px">{{ c.address }}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              <span :class="'badge ' + (c.status === 'active' ? 'badge-green' : 'badge-orange')">{{ c.status === 'active' ? 'Activo' : 'Observado' }}</span>
              <span style="font-size:10px;color:#9CA3AF">{{ c.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Conditions card (sticky) -->
      <div style="position:sticky;top:24px">
        <div v-if="!selectedClient" class="card card-pad" style="text-align:center;color:#9CA3AF">
          <div style="font-size:32px;margin-bottom:12px"><i class="pi pi-user"></i></div>
          <div style="font-size:13px">Selecciona un cliente para ver sus condiciones comerciales</div>
        </div>

        <template v-else>
          <div class="card card-pad" style="margin-bottom:12px">
            <div style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px;display:flex;align-items:center;gap:5px">
              <i class="pi pi-file-edit"></i> Condiciones comerciales
            </div>

            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
              <span style="color:#6B7280">Condición de pago</span>
              <span style="font-weight:600">{{ selectedClient.condition }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
              <span style="color:#6B7280">Tipo de cliente</span>
              <span style="font-weight:600">{{ selectedClient.type }}</span>
            </div>

            <template v-if="selectedClient.creditLimit">
              <div class="divider" style="margin:10px 0"></div>
              <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;margin-bottom:6px">Crédito</div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:4px">
                <span>Utilizado: S/ {{ selectedClient.creditUsed.toLocaleString() }}</span>
                <span>Límite: S/ {{ selectedClient.creditLimit.toLocaleString() }}</span>
              </div>
              <div class="credit-bar-wrap" style="margin-bottom:6px">
                <div class="credit-bar" :style="{ width: creditPercent(selectedClient) + '%', background: creditColor(selectedClient) }"></div>
              </div>
              <div v-if="selectedClient.creditUsed >= selectedClient.creditLimit" class="banner banner-danger" style="margin-top:8px">
                <i class="pi pi-times-circle"></i>
                <div>Crédito agotado. El pedido quedará bloqueado hasta regularizar.</div>
              </div>
              <div v-else-if="creditPercent(selectedClient) >= 80" class="banner banner-warning" style="margin-top:8px">
                <i class="pi pi-exclamation-triangle"></i>
                <div>Crédito al {{ creditPercent(selectedClient) }}%. Verifica antes de confirmar.</div>
              </div>
            </template>
            <template v-else>
              <div class="divider" style="margin:10px 0"></div>
              <div style="font-size:12px;color:#6B7280;display:flex;align-items:center;gap:5px">
                <i class="pi pi-credit-card"></i> Cliente al contado
              </div>
            </template>
          </div>

          <button
            class="btn btn-primary"
            style="width:100%;justify-content:center"
            :disabled="isCreditBlocked"
            @click="proceedToProducts"
          >
            Continuar <i class="pi pi-arrow-right"></i>
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- STEP 2: Products -->
  <div v-if="step === 2">
    <div class="card-title" style="margin-bottom:12px">Agregar productos para {{ selectedClient?.name }}</div>
    <div class="grid-2" style="align-items:start">
      <div class="card" style="overflow:hidden">
        <div class="card-header"><span class="card-title">Catálogo</span></div>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Disp.</th><th>Precio</th><th></th></tr></thead>
          <tbody>
            <tr v-for="p in D.products.filter(x => x.status !== 'out')" :key="p.id">
              <td>
                <div style="font-weight:500;font-size:13px">{{ p.name }}</div>
                <div class="mono" style="font-size:10px">{{ p.sku }}</div>
              </td>
              <td style="font-size:12px;color:#6B7280">{{ p.stock - p.reserved }} {{ p.unit }}</td>
              <td style="font-weight:600">S/ {{ p.price.toFixed(2) }}</td>
              <td><button class="btn btn-secondary btn-sm" @click="addLine(p)"><i class="pi pi-plus"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card card-pad" style="position:sticky;top:24px">
        <div class="card-title" style="margin-bottom:12px">Resumen ({{ lines.length }} ítems)</div>
        <div v-if="!lines.length" class="empty-state" style="padding:24px">
          <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
          <div class="empty-state-title">Sin productos aún</div>
          <div class="empty-state-desc">Selecciona productos del catálogo para construir el pedido</div>
        </div>
        <template v-else>
          <div v-for="l in lines" :key="l.productId" style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #F3F0EC">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500">{{ l.name }}</div>
              <div style="font-size:11px;color:#9CA3AF">S/ {{ l.price.toFixed(2) }} / {{ l.unit }}</div>
            </div>
            <input type="number" v-model.number="l.qty" :max="l.max" min="1" style="width:50px;border:1px solid #E5E7EB;border-radius:6px;padding:4px;font-size:13px;text-align:center" />
            <button class="btn btn-ghost btn-sm" @click="removeLine(l.productId)"><i class="pi pi-trash"></i></button>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin-top:12px;padding-top:12px;border-top:2px solid #E5E7EB">
            <span>Total</span><span>S/ {{ total.toFixed(2) }}</span>
          </div>
          <div v-if="hasInvalidLines" class="banner banner-danger" style="margin-top:12px">
            <i class="pi pi-exclamation-triangle"></i>
            <div>Ajusta cantidades: no pueden superar el stock disponible.</div>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:16px;justify-content:center" :disabled="hasInvalidLines" @click="step = 3">Continuar a entrega</button>
        </template>
      </div>
    </div>
  </div>

  <!-- STEP 3: Delivery -->
  <div v-if="step === 3">
    <div class="card card-pad" style="max-width:560px">
      <div class="card-title" style="margin-bottom:16px">Información de entrega</div>
      <div class="field" style="margin-bottom:14px">
        <div class="field-label">Fecha de entrega</div>
        <div class="field-input"><i class="pi pi-calendar"></i><input type="date" v-model="delivery.date" /></div>
      </div>
      <div class="field" style="margin-bottom:14px">
        <div class="field-label">Dirección</div>
        <div class="field-input"><i class="pi pi-map-marker"></i><input type="text" v-model="delivery.address" /></div>
      </div>
      <div class="field" style="margin-bottom:14px">
        <div class="field-label">Prioridad</div>
        <div class="field-input"><i class="pi pi-flag"></i>
          <select v-model="delivery.priority"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select>
        </div>
      </div>
      <div class="field" style="margin-bottom:14px">
        <div class="field-label">Notas (opcional)</div>
        <div class="field-input" style="align-items:flex-start"><i class="pi pi-pencil" style="margin-top:2px"></i>
          <textarea v-model="delivery.notes" rows="3" style="border:none;outline:none;font-size:13px;flex:1;background:transparent;resize:none" placeholder="Instrucciones para el repartidor..."></textarea>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button class="btn btn-ghost" @click="step = 2"><i class="pi pi-arrow-left"></i> Volver</button>
        <button class="btn btn-primary" style="flex:1;justify-content:center" @click="step = 4">Continuar a confirmación</button>
      </div>
    </div>
  </div>

  <!-- STEP 4: Confirm -->
  <div v-if="step === 4">
    <div class="grid-2" style="align-items:start">
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:12px">Cliente</div>
        <div style="font-weight:600">{{ selectedClient?.name }}</div>
        <div style="font-size:12px;color:#6B7280">{{ selectedClient?.contact }}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:8px">{{ delivery.address }}</div>
        <div class="divider"></div>
        <div class="card-title" style="margin-bottom:12px">Items</div>
        <div v-for="l in lines" :key="l.productId" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0">
          <span>{{ l.qty }} × {{ l.name }}</span>
          <span style="font-weight:600">S/ {{ (l.qty * l.price).toFixed(2) }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin-top:12px;padding-top:12px;border-top:2px solid #E5E7EB">
          <span>Total</span><span>S/ {{ total.toFixed(2) }}</span>
        </div>
      </div>
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:12px">Detalles de entrega</div>
        <div style="font-size:13px"><strong>Fecha:</strong> {{ delivery.date }}</div>
        <div style="font-size:13px;margin-top:4px"><strong>Prioridad:</strong> {{ delivery.priority }}</div>
        <div style="font-size:13px;margin-top:4px" v-if="delivery.notes"><strong>Notas:</strong> {{ delivery.notes }}</div>
        <div class="banner banner-info" style="margin-top:16px">
          <i class="pi pi-info-circle"></i>
          <div>El pedido entrará en estado <strong>En validación</strong>. Stock y condiciones se revisarán antes de confirmar.</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-ghost" @click="step = 3"><i class="pi pi-arrow-left"></i> Volver</button>
          <button class="btn btn-primary" style="flex:1;justify-content:center" @click="confirm"><i class="pi pi-check"></i> Confirmar pedido</button>
        </div>
      </div>
    </div>
  </div>
</template>
