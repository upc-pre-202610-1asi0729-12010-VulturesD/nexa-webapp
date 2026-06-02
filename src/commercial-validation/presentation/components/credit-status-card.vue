<script setup>
import { computed } from 'vue';
import { creditSummary } from '@/shared/credit';

const props = defineProps({ client: { type: Object, default: () => ({}) } });
const credit = computed(() => creditSummary(props.client));
</script>

<template>
  <section class="flow-panel">
    <div class="meta-label">Commercial Condition</div>
    <h3 style="margin-top:6px">{{ client.paymentCondition || client.condition || 'To validate' }}</h3>
    <span :class="'badge ' + credit.badgeClass">
      {{ credit.statusLabel }}
    </span>
    <div v-if="credit.limit" class="flow-note" style="margin-top:8px">
      S/ {{ credit.available.toLocaleString() }} available of S/ {{ credit.limit.toLocaleString() }} - due {{ credit.dueDate }}
    </div>
  </section>
</template>
