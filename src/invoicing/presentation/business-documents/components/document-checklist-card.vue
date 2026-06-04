<script setup>
import DocumentStatusBadge from './document-status-badge.vue';

defineProps({ documents: { type: Array, default: () => [] } });
</script>

<template>
  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>Document Checklist</h2>
        <p>Reference demo business documents. They do not represent official issuance.</p>
      </div>
    </div>
    <div class="flow-stack">
      <div v-for="document in documents" :key="document.id" class="mini-row">
        <span>{{ document.label }}</span>
        <document-status-badge :status="document.status" />
      </div>
    </div>
  </section>
</template>
