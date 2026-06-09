<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/iam/application/iam.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useDataStore } from '@/app/application/stores/data.store';

const router = useRouter();
const { t } = useI18n();
const auth = useAuthStore();
const cart = useCartStore();
const ds = useDataStore();
const requestedDeliveryDate = ref(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
const comments = ref('');
const client = computed(() => ds.clientById(auth.user?.clientId));
const addresses = computed(() => ds.D.deliveryAddresses.filter(address => address.clientId === auth.user?.clientId));
const selectedAddressId = ref('');
const selectedAddress = computed(() => selectedAddressId.value || addresses.value[0]?.id || null);
const canSubmit = computed(() => auth.user?.clientId && cart.items.length && selectedAddress.value);

function submitRequest() {
  if (!canSubmit.value) return;
  const request = ds.addPurchaseRequest({
    clientId: auth.user.clientId,
    buyerUserId: auth.user.id,
    deliveryAddressId: selectedAddress.value,
    requestedDeliveryDate: requestedDeliveryDate.value,
    comments: comments.value,
    items: cart.items,
  });
  cart.clear();
  router.push('/portal/purchase-requests/' + request.id);
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Request Builder</div>
        <div class="page-subtitle">Prepare a buyer request while catalog availability remains connected to operations data.</div>
      </div>
    </div>

    <div v-if="!auth.user?.clientId" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-ban"></i></div>
      <div class="empty-state-title">No linked client account</div>
    </div>

    <div v-else class="flow-grid-12">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Request items</div>
            <div class="flow-subtitle">{{ cart.count }} unit(s) selected from real backend catalog.</div>
          </div>
          <button class="btn btn-secondary btn-sm" @click="router.push('/portal/product-catalog')"><i class="pi pi-plus"></i> Add products</button>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="item in cart.items" :key="item.productId" class="mini-row">
            <span>{{ item.name }}</span>
            <strong>{{ item.qty }} x S/ {{ Number(item.price || 0).toFixed(2) }}</strong>
          </div>
          <div v-if="!cart.items.length" class="empty-state compact">
            <div class="empty-state-title">Cart is empty</div>
            <div class="empty-state-desc">Add products from the catalog to build a request.</div>
          </div>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Delivery and comments</div>
            <div class="flow-subtitle">{{ client?.commercialName || client?.businessName || auth.user.clientId }}</div>
          </div>
        </div>
        <div class="flow-panel-pad form-grid">
          <label class="field span-full">
            <span class="field-label">Delivery address</span>
            <select v-model="selectedAddressId" class="plain-input">
              <option value="">Default address</option>
              <option v-for="address in addresses" :key="address.id" :value="address.id">{{ address.label }} - {{ address.window }}</option>
            </select>
          </label>
          <label class="field span-full">
            <span class="field-label">Requested delivery date</span>
            <input v-model="requestedDeliveryDate" type="date" class="plain-input" />
          </label>
          <label class="field span-full">
            <span class="field-label">Commercial notes</span>
            <textarea v-model="comments" rows="4" class="plain-input" :placeholder="t('portal.requestNotesPlaceholder')"></textarea>
          </label>
          <button class="btn btn-primary span-full" :disabled="!canSubmit" @click="submitRequest">
            <i class="pi pi-send"></i> Submit request
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
