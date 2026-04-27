<script setup>
import Toast from 'primevue/toast';
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Toast position="top-right" />
</template>
