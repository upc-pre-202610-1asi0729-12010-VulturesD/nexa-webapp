<script setup>
defineProps({ client: { type: Object, default: () => ({}) } });
</script>

<template>
  <section class="flow-panel">
    <div class="meta-label">Client</div>
    <h2 style="margin-top:6px">{{ client.businessName || client.commercialName || client.name }}</h2>
    <p class="muted-text">RUC {{ client.ruc }} · {{ client.paymentCondition || client.condition }}</p>
    <span :class="'badge ' + (client.creditStatus === 'ok' ? 'badge-green' : client.creditStatus === 'blocked' ? 'badge-red' : 'badge-amber')">
      {{ client.creditStatus || 'to validate' }}
    </span>
  </section>
</template>
