<script setup>
import ColdChainBadge from '@/shared/presentation/components/cold-chain-badge.vue';

defineProps({ dispatch: { type: Object, default: () => ({}) }, clientName: { type: String, default: '' } });
</script>

<template>
  <article class="dispatch-card">
    <div class="dispatch-card-head">
      <strong>{{ dispatch.code || dispatch.id }}</strong>
      <span :class="'badge-priority-' + (dispatch.priority === 'high' ? 'high' : dispatch.priority === 'low' ? 'low' : 'medium')">{{ dispatch.priority }}</span>
    </div>
    <p>{{ clientName }}</p>
    <cold-chain-badge :cold-type="dispatch.coldType" />
    <div class="muted-text" style="margin-top:8px">{{ dispatch.routeName }} · {{ dispatch.driverName }}</div>
  </article>
</template>
