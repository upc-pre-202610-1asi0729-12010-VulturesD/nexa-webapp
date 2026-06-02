<script setup>
import { orderStepState } from '@/shared/status';

defineProps({
  order: { type: Object, default: () => ({}) },
  events: { type: Array, default: () => [] },
});

const steps = [
  ['Request received', 'submitted'],
  ['Commercial Validation', 'validating'],
  ['Purchase order confirmed', 'confirmed'],
  ['Business documents prepared', 'document_pending'],
  ['Ready for operations', 'ready_for_dispatch'],
  ['Preparing dispatch', 'preparing'],
  ['On route', 'in_route'],
  ['Delivered', 'delivered'],
];
</script>

<template>
  <div class="timeline">
    <div v-for="[label, key] in steps" :key="key" class="tl-item">
      <div class="tl-dot" :class="orderStepState(order.status, key) === 'done' ? 'badge-green' : orderStepState(order.status, key) === 'active' ? 'badge-blue' : 'badge-gray'">
        <i class="pi pi-check" aria-hidden="true"></i>
      </div>
      <div class="tl-spine"></div>
      <div class="tl-content">
        <div class="tl-title">{{ label }}</div>
        <div class="tl-meta">{{ events.find(event => event.status === key)?.timestamp || 'Pending' }}</div>
      </div>
    </div>
  </div>
</template>
