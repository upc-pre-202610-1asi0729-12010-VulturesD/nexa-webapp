<script setup>
import { requestStatusBadge, requestStatusLabel, orderStatusBadge, orderStatusLabel } from '@/shared/status';

const props = defineProps({
  status: { type: String, default: '' },
  type: { type: String, default: 'order' },
});

function badgeClass() {
  return props.type === 'request' ? requestStatusBadge(props.status) : orderStatusBadge(props.status);
}

function label() {
  return props.type === 'request' ? requestStatusLabel(props.status) : orderStatusLabel(props.status);
}
</script>

<template>
  <span :class="'badge ' + badgeClass()">{{ label() }}</span>
</template>
