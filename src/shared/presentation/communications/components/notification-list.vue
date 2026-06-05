<script setup>
defineProps({ notifications: { type: Array, default: () => [] } });
</script>

<template>
  <div class="flow-stack">
    <div v-for="notification in notifications" :key="notification.id" class="mini-row">
      <span>{{ notification.title }}</span>
      <span class="badge badge-blue">{{ notification.status }}</span>
    </div>
  </div>
</template>
