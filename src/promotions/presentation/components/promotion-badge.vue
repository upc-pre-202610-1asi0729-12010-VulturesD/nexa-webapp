<script setup>
defineProps({ label: { type: String, default: 'Active Offer' } });
</script>

<template>
  <span class="badge badge-orange">{{ label }}</span>
</template>
