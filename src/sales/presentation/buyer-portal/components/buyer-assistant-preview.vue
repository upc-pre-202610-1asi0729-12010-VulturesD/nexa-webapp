<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel, displayCode } from '@/shared/status';
import { buyerAssistantApiService } from '@/sales/infrastructure/buyer-portal/buyer-assistant-api';

const { t, locale } = useI18n();
const auth = useAuthStore();
const ds = useDataStore();

const open = ref(false);
const draft = ref('');
const loading = ref(false);
const messages = ref([
  {
    role: 'assistant',
    body: t('portal.assistant.welcome'),
  },
]);
const backendAssistantEnabled = import.meta.env.VITE_BUYER_ASSISTANT_API === 'true';

const clientId = computed(() => auth.user?.clientId);
const client = computed(() => ds.clientById(clientId.value));
const myOrders = computed(() => ds.D.purchaseOrders.filter(order => order.clientId === clientId.value));
const myDocs = computed(() => ds.D.businessDocuments.filter(doc => doc.clientId === clientId.value && doc.visibleToBuyer));
const myPromos = computed(() => ds.D.promotions.filter(promo => promo.status === 'active' && ['buyer_portal', 'client_specific'].includes(promo.visibility)));
const latestOrder = computed(() => myOrders.value.find(order => !['delivered', 'cancelled', 'rejected'].includes(order.status)) || myOrders.value[0]);

const chips = computed(() => [
  t('portal.assistant.chips.order'),
  t('portal.assistant.chips.documents'),
  t('portal.assistant.chips.delivery'),
  t('portal.assistant.chips.promotions'),
  t('portal.assistant.chips.request'),
  t('portal.assistant.chips.validation'),
]);

const assistantContext = computed(() => ({
  clientId: clientId.value,
  clientName: client.value?.commercialName || client.value?.name || null,
  activeOrderId: latestOrder.value?.id || null,
  orderCount: myOrders.value.length,
  visibleDocumentCount: myDocs.value.length,
  visiblePromotionCount: myPromos.value.length,
}));

watch(locale, () => {
  if (messages.value.length === 1 && messages.value[0]?.role === 'assistant') {
    messages.value = [{ role: 'assistant', body: t('portal.assistant.welcome') }];
  }
});

function answer(question) {
  const q = question.toLowerCase();
  if (q.includes('where') || q.includes('order') || q.includes('pedido') || q.includes('orden') || q.includes('donde') || q.includes('dónde')) {
    if (!latestOrder.value) return t('portal.assistant.answers.noOrder');
    return t('portal.assistant.answers.order', {
      code: displayCode(latestOrder.value),
      status: orderStatusLabel(latestOrder.value.status, locale.value),
    });
  }
  if (q.includes('document')) {
    return t('portal.assistant.answers.documents', { count: myDocs.value.length });
  }
  if (q.includes('delivery window') || q.includes('change') || q.includes('entrega') || q.includes('cambiar')) {
    return t('portal.assistant.answers.delivery');
  }
  if (q.includes('promotion') || q.includes('offer') || q.includes('promocion') || q.includes('promoción') || q.includes('oferta')) {
    return myPromos.value.length
      ? t('portal.assistant.answers.promotions', { count: myPromos.value.length })
      : t('portal.assistant.answers.noPromotions');
  }
  if (q.includes('create') || q.includes('request') || q.includes('solicitud') || q.includes('crear')) {
    return t('portal.assistant.answers.request');
  }
  if (q.includes('validation') || q.includes('validacion') || q.includes('validación')) {
    return t('portal.assistant.answers.validation');
  }
  return t('portal.assistant.answers.fallback');
}

async function ask(text) {
  const question = String(text || draft.value).trim();
  if (!question) return;
  messages.value.push({ role: 'buyer', body: question });
  draft.value = '';
  loading.value = true;

  let body = '';
  if (backendAssistantEnabled) {
    try {
      const response = await buyerAssistantApiService.send({
        message: question,
        locale: locale.value,
        context: assistantContext.value,
      });
      body = response?.answer || response?.message || response?.body || '';
    } catch (error) {
      body = '';
    }
  }

  messages.value.push({ role: 'assistant', body: body || answer(question) });
  loading.value = false;
}
</script>

<template>
  <div class="assistant-preview" :class="{ open }">
    <button class="assistant-launcher" @click="open = !open" :aria-label="t('portal.assistant.open')">
      <i class="pi pi-sparkles" aria-hidden="true"></i>
      <span>{{ t('portal.assistant.title') }}</span>
    </button>

    <section v-if="open" class="assistant-panel" :aria-label="t('portal.assistant.title')">
      <div class="assistant-head">
        <div>
          <div class="assistant-title">{{ t('portal.assistant.title') }}</div>
          <div class="assistant-subtitle">{{ t('portal.assistant.subtitle') }}</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="open = false" :aria-label="t('portal.assistant.close')"><i class="pi pi-times"></i></button>
      </div>

      <div class="assistant-disclaimer">
        {{ t('portal.assistant.disclaimer') }}
      </div>

      <div class="assistant-chips">
        <button v-for="chip in chips" :key="chip" class="filter-chip" @click="ask(chip)">{{ chip }}</button>
      </div>

      <div class="assistant-messages">
        <div v-for="(message, index) in messages" :key="index" class="assistant-message" :class="message.role">
          {{ message.body }}
        </div>
        <div v-if="loading" class="assistant-message assistant">
          {{ t('portal.assistant.thinking') }}
        </div>
      </div>

      <form class="assistant-input" @submit.prevent="ask()">
        <input v-model="draft" type="text" :placeholder="t('portal.assistant.placeholder')" :aria-label="t('portal.assistant.inputLabel')" />
        <button class="btn btn-primary btn-sm" type="submit" :disabled="!draft.trim() || loading">{{ t('portal.assistant.send') }}</button>
      </form>
    </section>
  </div>
</template>
