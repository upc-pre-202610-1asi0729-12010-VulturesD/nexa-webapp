<script setup>
defineProps({ promotion: { type: Object, default: () => ({}) } });
</script>

<template>
  <article class="flow-panel">
    <span :class="'badge ' + (promotion.status === 'active' ? 'badge-green' : promotion.status === 'expired' ? 'badge-gray' : 'badge-blue')">
      {{ promotion.status }}
    </span>
    <h3 style="margin-top:10px">{{ promotion.title || promotion.name }}</h3>
    <p class="muted-text">{{ promotion.description || promotion.notes }}</p>
  </article>
</template>
