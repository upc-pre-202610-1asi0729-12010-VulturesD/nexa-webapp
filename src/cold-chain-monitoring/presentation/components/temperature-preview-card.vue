<script setup>
defineProps({ logs: { type: Array, default: () => [] } });
</script>

<template>
  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>Temperatura referencial</h2>
        <p>Simulated preview, no real IoT connection.</p>
      </div>
      <span class="badge badge-purple">Premium preview</span>
    </div>
    <div v-for="log in logs" :key="log.id" class="mini-row">
      <span>{{ log.temperatureC }}°C</span>
      <span :class="'badge ' + (log.status === 'ok' ? 'badge-green' : 'badge-red')">{{ log.status }}</span>
    </div>
  </section>
</template>
