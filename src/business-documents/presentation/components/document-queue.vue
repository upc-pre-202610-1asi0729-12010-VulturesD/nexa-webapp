<script setup>
import DocumentStatusBadge from './document-status-badge.vue';

defineProps({ documents: { type: Array, default: () => [] } });
</script>

<template>
  <div class="flow-stack">
    <div v-for="document in documents" :key="document.id" class="mini-row">
      <span class="mono">{{ document.orderId }}</span>
      <span>{{ document.label }}</span>
      <document-status-badge :status="document.status" />
    </div>
  </div>
</template>
