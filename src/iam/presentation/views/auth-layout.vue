<script setup>
import { useI18n } from 'vue-i18n';
import logo from '@/assets/img/nexa.svg';

const { locale, t } = useI18n();
function setLang(l) { locale.value = l; localStorage.setItem('nexa.lang', l); }
</script>

<template>
  <div class="auth-page">
    <div class="auth-wrap">
      <!-- Brand panel -->
      <aside class="auth-left">
        <div class="auth-left-content">
          <div class="auth-logo"><img :src="logo" alt="Nexa" /></div>
          <div class="auth-tagline">{{ t('auth.tagline') }}</div>
          <div class="auth-desc">{{ t('auth.desc') }}</div>
          <div class="auth-pills">
            <span class="auth-pill">{{ t('auth.pillCatalog') }}</span>
            <span class="auth-pill">{{ t('auth.pillStock') }}</span>
            <span class="auth-pill">{{ t('auth.pillOrder') }}</span>
            <span class="auth-pill">{{ t('auth.pillDelivery') }}</span>
          </div>
        </div>
        <div class="auth-footer-left">
          <a href="https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/" class="auth-back-link" target="_blank" rel="noopener noreferrer">{{ t('auth.backToSite') }}</a>
          <span>{{ t('auth.rights') }}</span>
        </div>
      </aside>

      <!-- Form panel -->
      <section class="auth-right">
        <div class="lang-selector">
          <button class="lang-opt" :class="{ active: locale === 'es' }" @click="setLang('es')">ES</button>
          <button class="lang-opt" :class="{ active: locale === 'en' }" @click="setLang('en')">EN</button>
        </div>
        <router-view />
      </section>
    </div>
  </div>
</template>
