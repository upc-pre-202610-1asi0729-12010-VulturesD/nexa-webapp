<script setup>
defineProps({ checks: { type: Array, default: () => [] } });
</script>

<template>
  <div class="flow-stack">
    <div v-for="check in checks" :key="check.key || check.label" class="mini-row">
      <span>{{ check.label }}</span>
      <span :class="'badge ' + (check.status === 'ok' ? 'badge-green' : check.status === 'blocked' ? 'badge-red' : 'badge-amber')">{{ check.status }}</span>
    </div>
  </div>
</template>
