<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { orderStatusLabel } from '@/shared/status';

const auth = useAuthStore();
const ds = useDataStore();

const open = ref(false);
const draft = ref('');
const messages = ref([
  {
    role: 'assistant',
    body: 'Ask about your requests, orders, documents or delivery status. Demo responses are based on simulated data.',
  },
]);

const clientId = computed(() => auth.user?.clientId);
const myOrders = computed(() => ds.D.purchaseOrders.filter(order => order.clientId === clientId.value));
const myDocs = computed(() => ds.D.businessDocuments.filter(doc => doc.clientId === clientId.value && doc.visibleToBuyer));
const myPromos = computed(() => ds.D.promotions.filter(promo => promo.status === 'active' && ['buyer_portal', 'client_specific'].includes(promo.visibility)));
const latestOrder = computed(() => myOrders.value.find(order => !['delivered', 'cancelled', 'rejected'].includes(order.status)) || myOrders.value[0]);

const chips = [
  'Where is my order?',
  'Which documents are available?',
  'Can I change my delivery window?',
  'What products are on promotion?',
  'How do I create a request?',
  'What does commercial validation mean?',
];

function answer(question) {
  const q = question.toLowerCase();
  if (q.includes('where') || q.includes('order')) {
    if (!latestOrder.value) return 'No confirmed purchase order is active yet. Open My Requests to review commercial validation status.';
    return `Your latest purchase order ${latestOrder.value.id} is ${orderStatusLabel(latestOrder.value.status)}. Open My Orders to review the tracking timeline.`;
  }
  if (q.includes('document')) {
    return `${myDocs.value.length} buyer-visible business document(s) are available. Some files may remain pending until commercial validation is completed.`;
  }
  if (q.includes('delivery window') || q.includes('change')) {
    return 'Send a message in the purchase request conversation. The commercial team will confirm whether the change is possible.';
  }
  if (q.includes('promotion') || q.includes('offer')) {
    return myPromos.value.length
      ? `${myPromos.value.length} active promotion(s) are visible in your Buyer Portal. Offers remain subject to commercial validation.`
      : 'No active buyer-visible promotion is available right now.';
  }
  if (q.includes('create') || q.includes('request')) {
    return 'Open Product Catalog, add authorized products to your request, then review quantities and delivery details in Request Builder.';
  }
  if (q.includes('validation')) {
    return 'Commercial validation means the supplier reviews product availability, delivery conditions, business documents and buyer account status before confirming a purchase order.';
  }
  return 'This demo assistant can guide you to Product Catalog, My Requests, My Orders and Business Documents. No real AI service is connected in v1.';
}

function ask(text) {
  const question = String(text || draft.value).trim();
  if (!question) return;
  messages.value.push({ role: 'buyer', body: question });
  messages.value.push({ role: 'assistant', body: answer(question) });
  draft.value = '';
}
</script>

<template>
  <div class="assistant-preview" :class="{ open }">
    <button class="assistant-launcher" @click="open = !open" aria-label="Open Nexa Assistant preview">
      <i class="pi pi-sparkles" aria-hidden="true"></i>
      <span>Nexa Assistant</span>
    </button>

    <section v-if="open" class="assistant-panel" aria-label="Nexa Assistant preview">
      <div class="assistant-head">
        <div>
          <div class="assistant-title">Nexa Assistant</div>
          <div class="assistant-subtitle">Buyer Portal preview</div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="open = false" aria-label="Close assistant"><i class="pi pi-times"></i></button>
      </div>

      <div class="assistant-disclaimer">
        Assistant responses are simulated for the demo. No real AI service is connected in v1.
      </div>

      <div class="assistant-chips">
        <button v-for="chip in chips" :key="chip" class="filter-chip" @click="ask(chip)">{{ chip }}</button>
      </div>

      <div class="assistant-messages">
        <div v-for="(message, index) in messages" :key="index" class="assistant-message" :class="message.role">
          {{ message.body }}
        </div>
      </div>

      <form class="assistant-input" @submit.prevent="ask()">
        <input v-model="draft" type="text" placeholder="Ask a demo question..." aria-label="Ask Nexa Assistant" />
        <button class="btn btn-primary btn-sm" type="submit" :disabled="!draft.trim()">Send</button>
      </form>
    </section>
  </div>
</template>
