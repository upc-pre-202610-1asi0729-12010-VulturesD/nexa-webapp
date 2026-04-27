<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useProfileStore } from '@/iam/application/profile.store';
import i18n from '@/i18n';

const { t, locale } = useI18n();
const toast = useToast();
const store = useProfileStore();

const name     = ref('');
const email    = ref('');
const phone    = ref('');
const lang     = ref('es');
const notif    = ref(true);

const curPass  = ref('');
const newPass  = ref('');
const confPass = ref('');
const pwError  = ref('');

onMounted(() => {
  store.loadFromAuth();
  name.value  = store.profile.name;
  email.value = store.profile.email;
  phone.value = store.profile.phone;
  lang.value  = store.profile.language;
  notif.value = store.profile.notifEnabled;
});

async function saveInfo() {
  await store.save({ name: name.value, phone: phone.value, language: lang.value, notifEnabled: notif.value });
  i18n.global.locale.value = lang.value;
  toast.add({ severity: 'success', summary: t('profile.savedSuccess'), life: 3000 });
}

async function savePw() {
  pwError.value = '';
  if (!curPass.value || !newPass.value) return;
  if (newPass.value !== confPass.value) {
    pwError.value = 'Las contraseñas no coinciden';
    return;
  }
  await store.changePassword();
  curPass.value = '';
  newPass.value = '';
  confPass.value = '';
  toast.add({ severity: 'success', summary: 'Contraseña actualizada', life: 3000 });
}

function setLang(l) {
  lang.value = l;
}
</script>

<template>
  <div class="page-header" role="banner">
    <div>
      <div class="page-title">{{ t('profile.title') }}</div>
      <div class="page-subtitle">{{ t('profile.subtitle') }}</div>
    </div>
  </div>

  <div class="grid-2" style="align-items:start;gap:20px">

    <!-- Personal info -->
    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:20px">{{ t('profile.personalInfo') }}</div>

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <div style="width:64px;height:64px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:700;flex-shrink:0"
             :aria-label="t('profile.avatarHint')">
          {{ store.profile.initials || name.slice(0,2).toUpperCase() }}
        </div>
        <div>
          <div style="font-weight:600;font-size:14px">{{ name || store.profile.name }}</div>
          <div style="font-size:12px;color:#6B7280">{{ store.profile.role }}</div>
          <div style="font-size:12px;color:#9CA3AF">{{ store.profile.company }}</div>
        </div>
      </div>

      <div class="field" style="margin-bottom:16px">
        <label class="field-label" :for="'pf-name'">{{ t('profile.name') }}</label>
        <div class="field-input">
          <i class="pi pi-user"></i>
          <input id="pf-name" type="text" v-model="name" :placeholder="t('profile.name')" />
        </div>
      </div>

      <div class="field" style="margin-bottom:16px">
        <label class="field-label" :for="'pf-email'">{{ t('profile.email') }}</label>
        <div class="field-input" style="background:#F9F7F4">
          <i class="pi pi-envelope"></i>
          <input id="pf-email" type="email" v-model="email" disabled style="color:#9CA3AF" />
        </div>
        <span class="field-hint">El correo no puede modificarse desde aquí</span>
      </div>

      <div class="field" style="margin-bottom:16px">
        <label class="field-label" :for="'pf-role'">{{ t('profile.role') }}</label>
        <div class="field-input" style="background:#F9F7F4">
          <i class="pi pi-id-card"></i>
          <input id="pf-role" type="text" :value="store.profile.role" disabled style="color:#9CA3AF" />
        </div>
      </div>

      <div class="field" style="margin-bottom:20px">
        <label class="field-label" :for="'pf-phone'">{{ t('profile.phone') }}</label>
        <div class="field-input">
          <i class="pi pi-phone"></i>
          <input id="pf-phone" type="tel" v-model="phone" placeholder="+51 999 000 000" />
        </div>
      </div>

      <button class="btn btn-primary" style="width:100%;justify-content:center" @click="saveInfo" :disabled="store.loading">
        <template v-if="store.loading"><div class="spinner"></div></template>
        <template v-else><i class="pi pi-check"></i></template>
        {{ t('profile.saveChanges') }}
      </button>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Preferences -->
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:16px">{{ t('profile.preferences') }}</div>

        <div style="margin-bottom:16px">
          <div class="field-label" style="margin-bottom:8px">{{ t('profile.language') }}</div>
          <div style="display:flex;gap:6px">
            <button
              class="lang-opt"
              :class="{ active: lang === 'es' }"
              @click="setLang('es')"
              :aria-pressed="lang === 'es'"
            >🇵🇪 Español</button>
            <button
              class="lang-opt"
              :class="{ active: lang === 'en' }"
              @click="setLang('en')"
              :aria-pressed="lang === 'en'"
            >🇺🇸 English</button>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid #F3F0EC">
          <div>
            <div style="font-size:13px;font-weight:500;color:#374151">{{ t('profile.notifications') }}</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:2px">{{ t('profile.notifDesc') }}</div>
          </div>
          <button
            style="width:40px;height:22px;border-radius:9999px;border:none;cursor:pointer;transition:background 200ms;position:relative"
            :style="{ background: notif ? '#2563EB' : '#E5E7EB' }"
            @click="notif = !notif"
            :aria-checked="notif"
            role="switch"
          >
            <span style="position:absolute;top:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:left 200ms;box-shadow:0 1px 3px rgba(0,0,0,0.2)"
                  :style="{ left: notif ? '21px' : '3px' }"></span>
          </button>
        </div>
      </div>

      <!-- Security -->
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:16px">{{ t('profile.security') }}</div>
        <div class="card-title" style="font-size:13px;font-weight:500;margin-bottom:12px;color:#374151">{{ t('profile.changePassword') }}</div>

        <div v-if="pwError" class="state-alert" style="margin-bottom:12px;padding:10px 12px;font-size:12px">
          <i class="pi pi-times-circle" style="flex-shrink:0"></i>
          <span>{{ pwError }}</span>
        </div>

        <div class="field" style="margin-bottom:12px">
          <label class="field-label" :for="'pf-curpw'">{{ t('profile.currentPassword') }}</label>
          <div class="field-input">
            <i class="pi pi-lock"></i>
            <input id="pf-curpw" type="password" v-model="curPass" placeholder="••••••••" />
          </div>
        </div>

        <div class="field" style="margin-bottom:12px">
          <label class="field-label" :for="'pf-newpw'">{{ t('profile.newPassword') }}</label>
          <div class="field-input">
            <i class="pi pi-lock"></i>
            <input id="pf-newpw" type="password" v-model="newPass" placeholder="••••••••" />
          </div>
        </div>

        <div class="field" style="margin-bottom:16px">
          <label class="field-label" :for="'pf-confpw'">{{ t('profile.confirmPassword') }}</label>
          <div class="field-input" :class="{ error: pwError }">
            <i class="pi pi-lock"></i>
            <input id="pf-confpw" type="password" v-model="confPass" placeholder="••••••••" />
          </div>
        </div>

        <button class="btn btn-ghost" style="width:100%;justify-content:center" @click="savePw">
          <i class="pi pi-shield"></i> {{ t('profile.changePassword') }}
        </button>
      </div>

    </div>
  </div>
</template>
