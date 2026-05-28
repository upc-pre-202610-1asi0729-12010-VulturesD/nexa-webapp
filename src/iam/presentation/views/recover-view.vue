<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const email = ref('');
const sent  = ref(false);
</script>

<template>
  <template v-if="!sent">
    <div class="auth-form-title">{{ t('auth.recover') }}</div>
    <div class="auth-form-sub">{{ t('auth.recoverDesc') }}</div>
    <div class="field" style="margin-bottom:16px">
      <label style="display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:5px">{{ t('auth.email') }}</label>
      <div class="field-input">
        <i class="pi pi-envelope"></i>
        <input type="email" v-model="email" placeholder="tu@empresa.pe" />
      </div>
    </div>
    <button class="btn-full btn-primary-full" style="margin-bottom:12px" @click="sent = true">
      {{ t('auth.sendLink') }}
    </button>
    <router-link to="/auth/login" class="btn-full btn-ghost-full" style="text-decoration:none">
      <i class="pi pi-arrow-left"></i> {{ t('auth.back') }}
    </router-link>
  </template>

  <template v-else>
    <div style="text-align:center;padding:24px 0">
      <div style="width:56px;height:56px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <i class="pi pi-check" style="font-size:22px;color:#15803D"></i>
      </div>
      <div class="auth-form-title" style="text-align:center">Revisa tu correo</div>
      <div class="auth-form-sub" style="text-align:center;margin-bottom:24px">
        Enviamos un enlace a <strong>{{ email || 'tu@empresa.pe' }}</strong>. El enlace expira en 30 minutos.
      </div>
      <router-link to="/auth/login" class="btn-full btn-ghost-full" style="text-decoration:none">
        <i class="pi pi-arrow-left"></i> {{ t('auth.back') }}
      </router-link>
    </div>
  </template>
</template>
