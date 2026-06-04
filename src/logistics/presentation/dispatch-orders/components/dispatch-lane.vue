<script setup>
defineProps({ title: { type: String, default: '' }, count: { type: Number, default: 0 } });
</script>

<template>
  <section class="kanban-column">
    <div class="kanban-column-head">
      <h3>{{ title }}</h3>
      <span class="badge badge-gray">{{ count }}</span>
    </div>
    <slot />
  </section>
</template>
