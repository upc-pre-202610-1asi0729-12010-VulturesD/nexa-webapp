<script setup>
import ColdChainBadge from '@/shared/presentation/components/cold-chain-badge.vue';

defineProps({ product: { type: Object, default: () => ({}) } });
defineEmits(['add']);
</script>

<template>
  <article class="buyer-product-card">
    <div :class="'product-placeholder cat-' + (product.imagePlaceholderType || 'default')">
      <div class="pp-icon"><i class="pi pi-box" aria-hidden="true"></i></div>
      <div class="pp-cat">{{ product.categoryName }}</div>
    </div>
    <div class="card-pad">
      <cold-chain-badge :cold-type="product.coldType" />
      <h3 style="margin-top:10px">{{ product.name }}</h3>
      <p class="muted-text">{{ product.temperatureRange }} · {{ product.unit }}</p>
      <button class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center" @click="$emit('add', product)">
        Add to Request
      </button>
    </div>
  </article>
</template>
