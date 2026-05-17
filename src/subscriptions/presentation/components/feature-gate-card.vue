<script setup>
defineProps({
  title: { type: String, default: '' },
  enabled: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
});
</script>

<template>
  <section class="flow-panel">
    <span :class="'badge ' + (enabled ? 'badge-green' : preview ? 'badge-purple' : 'badge-gray')">
      {{ enabled ? 'Available' : preview ? 'Premium preview' : 'Blocked' }}
    </span>
    <h3 style="margin-top:10px">{{ title }}</h3>
    <slot />
  </section>
</template>
