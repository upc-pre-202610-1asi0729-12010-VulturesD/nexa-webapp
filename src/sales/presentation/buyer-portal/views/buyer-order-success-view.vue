<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';

const route  = useRoute();
const router = useRouter();
const { t } = useI18n();
const ds = useDataStore();
const auth = useAuthStore();

const order = computed(() => {
  if (!route.query.orderId || !auth.user?.clientId) return null;
  const found = ds.orderById(route.query.orderId);
  return found?.clientId === auth.user.clientId ? found : null;
});
const orderId   = computed(() => order.value?.id || '');
const total     = computed(() => order.value?.total || 0);
const itemCount = computed(() => order.value?.items?.length || 0);
</script>

<template>
  <div v-if="!order" style="max-width:520px;margin:48px auto;text-align:center;padding:0 16px">
    <div style="width:80px;height:80px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
      <i class="pi pi-search" style="font-size:36px;color:#B91C1C"></i>
    </div>
    <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:700;color:#111827;margin-bottom:8px">
      {{ t('portal.orderNotFound') }}
    </div>
    <div style="font-size:14px;color:#6B7280;margin-bottom:24px;line-height:1.6">
      {{ t('portal.orderNotFoundDesc') }}
    </div>
    <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">
      <i class="pi pi-box"></i> {{ t('portal.backToCatalog') }}
    </button>
  </div>

  <div v-else style="max-width:520px;margin:48px auto;text-align:center;padding:0 16px">
    <div style="width:80px;height:80px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
      <i class="pi pi-check" style="font-size:36px;color:#15803D"></i>
    </div>

    <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:700;color:#111827;margin-bottom:8px">
      {{ t('portal.orderSent') }}
    </div>
    <div style="font-size:14px;color:#6B7280;margin-bottom:32px;line-height:1.6">
      {{ t('portal.orderSentDesc', { total: Number(total).toFixed(2) }) }}
    </div>

    <div class="card card-pad" style="text-align:left;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em">{{ t('portal.orderNumber') }}</div>
        <span class="badge badge-blue">{{ t('orders.status.validating') }}</span>
      </div>
      <div class="mono" style="font-size:20px;font-weight:700;color:#1D4ED8;margin-bottom:16px">{{ orderId }}</div>
      <div class="divider" style="margin:0 0 12px"></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
        <span style="color:#6B7280">{{ t('portal.products') }}</span>
        <span style="font-weight:500">{{ itemCount }}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700">
        <span>{{ t('portal.total') }}</span>
        <span>S/ {{ Number(total).toFixed(2) }}</span>
      </div>
    </div>

    <div class="banner banner-info" style="text-align:left;margin-bottom:24px">
      <i class="pi pi-info-circle"></i>
      <div>
        <strong>{{ t('portal.whatsNext') }}</strong> {{ t('portal.whatsNextDesc') }}
      </div>
    </div>

    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-ghost" @click="router.push('/portal/purchase-orders')">
        <i class="pi pi-clipboard"></i> {{ t('portal.viewMyOrders') }}
      </button>
      <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">
        <i class="pi pi-box"></i> {{ t('portal.keepShopping') }}
      </button>
    </div>
  </div>
</template>
