<script setup>
defineProps({ tasks: { type: Array, default: () => [] } });
</script>

<template>
  <div class="flow-stack">
    <div v-for="task in tasks" :key="task.id" class="mini-row">
      <span class="mono">{{ task.orderId }}</span>
      <span :class="'badge ' + (task.status === 'completed' ? 'badge-green' : 'badge-amber')">{{ task.status }}</span>
    </div>
  </div>
</template>
