<script setup>
defineProps({ requirements: { type: Object, default: () => ({}) } });
</script>

<template>
  <section class="flow-panel">
    <h2>External Portal Requirements</h2>
    <p class="muted-text">Simulated manual upload flow for v1.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">
      <span v-for="type in requirements.requiredDocumentTypes || []" :key="type" class="badge badge-blue">{{ type }}</span>
    </div>
  </section>
</template>
