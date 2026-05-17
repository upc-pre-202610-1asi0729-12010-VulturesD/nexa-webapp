<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'pi-chart-line' },
});
</script>

<template>
  <section class="card kpi-card">
    <div class="kpi-label"><i :class="'pi ' + icon" aria-hidden="true"></i>{{ label }}</div>
    <div class="kpi-value">{{ value }}</div>
    <div class="kpi-sub">{{ hint }}</div>
  </section>
</template>
