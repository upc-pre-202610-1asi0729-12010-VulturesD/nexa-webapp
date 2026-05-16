<script setup>
import { orderStatusBadge, orderStatusLabel } from '@/shared/status';

defineProps({ order: { type: Object, default: () => ({}) } });
</script>

<template>
  <section class="flow-panel">
    <div class="meta-label">Status de tracking</div>
    <h2 style="margin-top:6px">{{ order.code || order.id }}</h2>
    <span :class="'badge ' + orderStatusBadge(order.status)">{{ orderStatusLabel(order.status) }}</span>
  </section>
</template>
