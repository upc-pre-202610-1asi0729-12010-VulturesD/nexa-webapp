<script setup>
defineProps({
  title: { type: String, default: 'Sin datos' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'pi-inbox' },
});
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-icon"><i :class="'pi ' + icon" aria-hidden="true"></i></div>
    <div class="empty-state-title">{{ title }}</div>
    <div class="empty-state-desc">{{ description }}</div>
    <div class="empty-state-action"><slot /></div>
  </div>
</template>
