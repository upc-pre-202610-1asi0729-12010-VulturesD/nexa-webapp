<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/iam/application/iam.store';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const pass  = ref('');
const showPass = ref(false);
const error = ref('');
const loading = ref(false);

const demoProfiles = computed(() =>
  auth.demoUsers
    .filter(profile => profile.scope === 'ops')
    .map(profile => ({
      name: profile.name,
      role: profile.roleName || profile.role,
      email: profile.email,
      pass: profile.password,
      initials: profile.initials,
      department: profile.department,
    }))
);

onMounted(() => {
  auth.loadDemoUsers().catch(() => {});
});

function pickProfile(p) {
  email.value = p.email;
  pass.value = p.pass;
  error.value = '';
}

async function doLogin() {
  error.value = '';
  if (!email.value || !pass.value) {
    error.value = t('auth.wrongCreds');
    return;
  }
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: pass.value });
    const target = auth.scope === 'portal' ? '/portal/home' : '/ops/dashboard';
    setTimeout(() => {
      loading.value = false;
      router.push(target);
    }, 600);
  } catch {
    loading.value = false;
    error.value = t('auth.wrongCreds');
  }
}
</script>

<template>
  <div class="auth-form-title">{{ t('auth.welcome') }}</div>
  <div class="auth-form-sub">{{ t('auth.subtitle') }}</div>

  <!-- Demo profiles -->
  <div style="margin-bottom:20px">
    <div class="profile-section-label">{{ t('auth.quickAccess') }}</div>
    <div v-if="demoProfiles.length" class="profile-list">
      <div
        v-for="p in demoProfiles"
        :key="p.email"
        class="profile-card"
        :class="{ 'profile-card--active': email === p.email }"
        @click="pickProfile(p)"
      >
        <div class="profile-avatar">{{ p.initials }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ p.name }}</div>
          <div class="profile-role">{{ p.role }} · {{ p.department }}</div>
        </div>
        <i v-if="email === p.email" class="pi pi-check-circle profile-check" aria-hidden="true"></i>
      </div>
    </div>
    <div v-else class="profile-empty">{{ t('auth.noUsers') }}</div>
  </div>

  <div class="state-alert" v-if="error">
    <i class="pi pi-times-circle" style="flex-shrink:0;margin-top:1px"></i>
    <div><strong>{{ error }}</strong><br>{{ t('auth.wrongCredsDesc') }}</div>
  </div>

  <div class="field" style="margin-bottom:16px">
    <label style="display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:5px">{{ t('auth.email') }}</label>
    <div class="field-input" :class="{ error: !!error }">
      <i class="pi pi-envelope"></i>
      <input type="email" v-model="email" :placeholder="$t('auth.email')" :disabled="loading" />
    </div>
  </div>

  <div class="field" style="margin-bottom:8px">
    <label style="display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:5px">{{ t('auth.password') }}</label>
    <div class="field-input" :class="{ error: !!error }">
      <i class="pi pi-lock"></i>
      <input :type="showPass ? 'text' : 'password'" v-model="pass" placeholder="••••••••" :disabled="loading" />
      <i :class="'pi ' + (showPass ? 'pi-eye-slash' : 'pi-eye')" style="cursor:pointer;color:#9CA3AF" @click="showPass = !showPass"></i>
    </div>
  </div>

  <div style="text-align:right;margin-bottom:20px">
    <router-link to="/auth/recover" class="auth-link">{{ t('auth.forgot') }}</router-link>
  </div>

  <button class="btn-full btn-primary-full" @click="doLogin" :disabled="loading">
    <template v-if="loading"><div class="spinner"></div> {{ t('auth.verifying') }}</template>
    <template v-else>{{ t('auth.signIn') }}</template>
  </button>
</template>

<style scoped>
.profile-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 8px;
}
.profile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
  background: #fff;
}
.profile-card:hover {
  border-color: #BFDBFE;
  background: #F9F7F4;
}
.profile-card--active {
  border-color: #2563EB;
  background: #EFF6FF;
}
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #EEF2FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #4F46E5;
  flex-shrink: 0;
}
.profile-info {
  flex: 1;
  min-width: 0;
}
.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: #1F2937;
}
.profile-role {
  font-size: 11px;
  color: #6B7280;
}
.profile-check {
  color: #2563EB;
  font-size: 14px;
}
.profile-empty {
  font-size: 12px;
  color: #9CA3AF;
  padding: 10px 0;
  text-align: center;
}
</style>
