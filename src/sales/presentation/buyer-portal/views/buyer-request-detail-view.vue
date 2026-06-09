<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { requestStatusLabel, requestStatusBadge, displayCode } from '@/shared/status';

const route = useRoute();
const router = useRouter();
const ds = useDataStore();
const request = computed(() => ds.purchaseRequestById(route.params.id));
const items = computed(() => request.value ? ds.requestItemsFor(request.value.id) : []);
const messages = computed(() => request.value ? ds.messagesForRequest(request.value.id) : []);
</script>

<template>
  <div v-if="!request" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-file"></i></div>
    <div class="empty-state-title">Request not found</div>
    <button class="btn btn-primary" @click="router.push('/portal/purchase-requests')">Back to requests</button>
  </div>

  <div v-else>
    <div class="page-header">
      <div>
        <div class="page-title">{{ displayCode(request) }}</div>
        <div class="page-subtitle">Local request workflow record for buyer coordination.</div>
      </div>
      <span :class="'badge ' + requestStatusBadge(request.status)">{{ requestStatusLabel(request.status) }}</span>
    </div>

    <div class="flow-grid-12">
      <section class="flow-panel span-7">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Requested products</div>
            <div class="flow-subtitle">{{ items.length }} line item(s)</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="item in items" :key="item.id" class="mini-row">
            <span>{{ ds.productName(item.productId) }}</span>
            <strong>{{ item.quantity }} {{ item.unit }}</strong>
          </div>
        </div>
      </section>

      <section class="flow-panel span-5">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Request details</div>
            <div class="flow-subtitle">{{ request.comments }}</div>
          </div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div class="mini-row"><span>Delivery date</span><strong>{{ request.requestedDeliveryDate }}</strong></div>
          <div class="mini-row"><span>Address</span><strong>{{ request.deliveryAddressId }}</strong></div>
          <div class="mini-row"><span>Document profile</span><strong>{{ request.documentProfile }}</strong></div>
        </div>
      </section>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div class="flow-title">Conversation</div>
        </div>
        <div class="flow-panel-pad flow-stack">
          <div v-for="message in messages" :key="message.id" class="flow-list-item">
            <div>
              <strong>{{ message.senderName }}</strong>
              <div class="flow-note">{{ message.body }}</div>
            </div>
            <span class="badge badge-gray">{{ message.senderRole }}</span>
          </div>
          <div v-if="!messages.length" class="empty-state compact">
            <div class="empty-state-title">No conversation messages</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
