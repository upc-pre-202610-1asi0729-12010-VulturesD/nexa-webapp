<script setup>
defineProps({ client: { type: Object, default: () => ({}) } });
</script>

<template>
  <section class="flow-panel">
    <div class="meta-label">Commercial Condition</div>
    <h3 style="margin-top:6px">{{ client.paymentCondition || client.condition || 'To validate' }}</h3>
    <span :class="'badge ' + (client.creditStatus === 'ok' ? 'badge-green' : client.creditStatus === 'blocked' ? 'badge-red' : 'badge-amber')">
      {{ client.creditStatus || 'pending' }}
    </span>
  </section>
</template>
