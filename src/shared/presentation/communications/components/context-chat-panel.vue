<script setup>
defineProps({ messages: { type: Array, default: () => [] } });
</script>

<template>
  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>Comentarios</h2>
        <p>Simulated contextual communication between S1, S2 and S3.</p>
      </div>
    </div>
    <div class="flow-stack">
      <div v-for="message in messages" :key="message.id" class="message-bubble">
        <strong>{{ message.senderName }}</strong>
        <p>{{ message.body }}</p>
      </div>
      <div v-if="!messages.length" class="empty-state">
        <div class="empty-state-title">Sin mensajes</div>
      </div>
    </div>
  </section>
</template>
