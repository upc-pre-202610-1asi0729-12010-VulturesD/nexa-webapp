<script setup>
import { documentStatusBadge, documentStatusLabel } from '@/shared/status';

defineProps({ status: { type: String, default: 'pending' } });
</script>

<template>
  <span :class="'badge ' + documentStatusBadge(status)">{{ documentStatusLabel(status) }}</span>
</template>
