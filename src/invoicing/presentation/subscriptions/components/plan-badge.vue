<script setup>
defineProps({ plan: { type: String, default: 'standard' } });
</script>

<template>
  <!-- #3 PlanBadge belongs to subscriptions because it expresses SaaS plan state. -->
  <span :class="'badge ' + (plan === 'premium' ? 'badge-purple' : plan === 'starter' ? 'badge-gray' : 'badge-blue')">{{ plan }}</span>
</template>
