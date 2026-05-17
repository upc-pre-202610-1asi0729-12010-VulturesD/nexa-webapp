import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

const ENGLISH_FIRST_VERSION = '2026-05-20';
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('nexa.lang') : null;
const migrated = typeof localStorage !== 'undefined' ? localStorage.getItem('nexa.lang.version') : null;

if (typeof localStorage !== 'undefined' && migrated !== ENGLISH_FIRST_VERSION) {
  localStorage.setItem('nexa.lang', 'en');
  localStorage.setItem('nexa.lang.version', ENGLISH_FIRST_VERSION);
}

const currentLocale = (typeof localStorage !== 'undefined' && localStorage.getItem('nexa.lang')) || stored || 'en';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: currentLocale,
  fallbackLocale: 'en',
  messages: { es, en },
});

export default i18n;
