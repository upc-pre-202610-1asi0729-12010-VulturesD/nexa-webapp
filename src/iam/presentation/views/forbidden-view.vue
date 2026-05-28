<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const homePath = computed(() => auth.scope === 'portal' ? '/portal/home' : '/ops/dashboard');
const requestedScope = computed(() => route.query.required === 'portal' ? 'Portal B2B' : 'Nexa Ops');
</script>

<template>
  <div class="auth-form-title">Unauthorized Access</div>
  <div class="auth-form-sub">Your account does not have permission to enter {{ requestedScope }}.</div>
  <div class="state-alert">
    <i class="pi pi-ban" style="flex-shrink:0;margin-top:1px"></i>
    <div>
      <strong>Insufficient permission</strong><br>
      Return to your assigned workspace or request access from the operations owner.
    </div>
  </div>
  <button class="btn-full btn-primary-full" @click="router.push(homePath)">
    <i class="pi pi-arrow-right"></i> Go to my workspace
  </button>
  <router-link to="/auth/login" class="btn-full btn-ghost-full" style="text-decoration:none;margin-top:10px">
    <i class="pi pi-arrow-left"></i> Switch account
  </router-link>
</template>
