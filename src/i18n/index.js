import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('nexa.lang')) || 'en';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: stored,
  fallbackLocale: 'en',
  messages: { es, en },
});

export default i18n;
