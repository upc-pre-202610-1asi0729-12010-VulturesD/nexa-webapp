<script setup>
import { coldTypeBadge, coldTypeLabel } from '@/shared/status';

defineProps({ coldType: { type: String, default: 'chilled' } });
</script>

<template>
  <span :class="'badge cold-badge ' + coldTypeBadge(coldType)">{{ coldTypeLabel(coldType) }}</span>
</template>
