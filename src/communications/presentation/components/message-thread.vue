<script setup>
defineProps({ messages: { type: Array, default: () => [] } });
</script>

<template>
  <div class="flow-stack">
    <div v-for="message in messages" :key="message.id" class="mini-row">
      <span>{{ message.senderName }}</span>
      <span class="muted-text">{{ message.body }}</span>
    </div>
  </div>
</template>
