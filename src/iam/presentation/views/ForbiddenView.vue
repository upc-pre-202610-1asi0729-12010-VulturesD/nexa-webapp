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
  <div class="auth-form-title">Acceso no autorizado</div>
  <div class="auth-form-sub">Tu cuenta no tiene permiso para entrar a {{ requestedScope }}.</div>
  <div class="state-alert">
    <i class="pi pi-ban" style="flex-shrink:0;margin-top:1px"></i>
    <div>
      <strong>Permiso insuficiente</strong><br>
      Regresa a tu espacio asignado o solicita acceso al administrador.
    </div>
  </div>
  <button class="btn-full btn-primary-full" @click="router.push(homePath)">
    <i class="pi pi-arrow-right"></i> Ir a mi espacio
  </button>
  <router-link to="/auth/login" class="btn-full btn-ghost-full" style="text-decoration:none;margin-top:10px">
    <i class="pi pi-arrow-left"></i> Cambiar cuenta
  </router-link>
</template>
