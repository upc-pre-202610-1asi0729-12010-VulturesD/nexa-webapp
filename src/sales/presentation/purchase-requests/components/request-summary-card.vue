<script setup>
import StatusBadge from '@/shared/presentation/components/status-badge.vue';

defineProps({ request: { type: Object, default: () => ({}) }, clientName: { type: String, default: '' } });
</script>

<template>
  <article class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>{{ request.code || request.id }}</h2>
        <p>{{ clientName }}</p>
      </div>
      <status-badge type="request" :status="request.status" />
    </div>
    <div class="mini-row">
      <span>Priority</span>
      <span class="badge badge-blue">{{ request.priority || 'normal' }}</span>
    </div>
  </article>
</template>
