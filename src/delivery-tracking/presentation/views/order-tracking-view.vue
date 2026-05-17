<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import OrderTimeline from '@/delivery-tracking/presentation/components/order-timeline.vue';

const route = useRoute();
const ds = useDataStore();
const order = computed(() => ds.purchaseOrderById(route.params.id) || {});
const events = computed(() => ds.timelineForOrder(order.value.id));
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ order.code || order.id || 'Tracking' }}</h1>
        <p class="page-subtitle">Simulated tracking visible to S3.</p>
      </div>
    </div>
    <order-timeline :order="order" :events="events" />
  </div>
</template>
