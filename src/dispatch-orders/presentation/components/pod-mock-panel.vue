<script setup>
defineProps({ pod: { type: Object, default: () => ({}) } });
defineEmits(['complete']);
</script>

<template>
  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>Proof of Delivery</h2>
        <p>Signature and photo are simulated for demo.</p>
      </div>
      <span :class="'badge ' + (pod.status === 'complete' ? 'badge-green' : 'badge-amber')">{{ pod.status || 'pending' }}</span>
    </div>
    <button class="btn btn-primary" @click="$emit('complete')">Complete POD Mock</button>
  </section>
</template>
