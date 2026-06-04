<script setup>
defineProps({ request: { type: Object, default: () => ({}) } });
defineEmits(['approve', 'convert']);
</script>

<template>
  <section class="flow-panel">
    <div class="flow-panel-head">
      <div>
        <h2>Commercial Conversion</h2>
        <p>A request becomes a purchase order only after client, stock and document validation.</p>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-secondary" @click="$emit('approve', request.id)">Aprobar</button>
      <button class="btn btn-primary" @click="$emit('convert', request.id)">Convert to Purchase Order</button>
    </div>
  </section>
</template>
