<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <div class="auth-form-title">{{ t('auth.blocked') }}</div>
  <div class="auth-form-sub">{{ t('auth.blockedDesc') }}</div>
  <div class="state-warn">
    <i class="pi pi-exclamation-triangle" style="flex-shrink:0;margin-top:1px"></i>
    <div><strong>Cuenta pendiente de activación</strong><br>
      Tu cuenta fue creada pero aún no ha sido activada por el administrador. Recibirás un correo cuando esté lista.
    </div>
  </div>
  <div class="state-alert">
    <i class="pi pi-ban" style="flex-shrink:0;margin-top:1px"></i>
    <div><strong>Cuenta bloqueada</strong><br>
      Por razones de seguridad, tu cuenta fue bloqueada temporalmente. Contacta al administrador.
    </div>
  </div>
  <router-link to="/auth/login" class="btn-full btn-ghost-full" style="text-decoration:none">
    <i class="pi pi-arrow-left"></i> {{ t('auth.back') }}
  </router-link>
</template>
