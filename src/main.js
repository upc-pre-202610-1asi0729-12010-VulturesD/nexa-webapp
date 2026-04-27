import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import App from './app/App.vue';
import router from './router';
import i18n from './i18n';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/styles/tokens.css';
import './assets/styles/ops.css';
import './assets/styles/app.css';

const NexaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, {
  theme: { preset: NexaPreset, options: { darkModeSelector: '.nexa-dark' } },
  ripple: false,
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
