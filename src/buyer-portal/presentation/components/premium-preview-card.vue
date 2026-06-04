<script setup>
defineProps({ title: { type: String, default: '' }, icon: { type: String, default: 'pi-lock' } });
</script>

<template>
  <article class="premium-preview-card">
    <i :class="'pi ' + icon" aria-hidden="true"></i>
    <h3>{{ title }}</h3>
    <p>Premium capability for advanced buyer workflows and operational visibility.</p>
  </article>
</template>
