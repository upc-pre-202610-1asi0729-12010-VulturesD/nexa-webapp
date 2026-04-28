import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Profile } from '../domain/model/profile.model';
import { useAuthStore } from '@/iam/application/iam.store';

export const useProfileStore = defineStore('profile', () => {
  const profile  = ref(new Profile());
  const loading  = ref(false);
  const saved    = ref(false);
  const pwSaved  = ref(false);

  function loadFromAuth() {
    const auth = useAuthStore();
    if (auth.user) {
      profile.value = new Profile({
        id:       auth.user.id       || '1',
        name:     auth.user.name     || '',
        email:    auth.user.email    || '',
        role:     auth.user.role     || '',
        company:  auth.user.company  || 'Frío Pacífico S.A.C.',
        phone:    auth.user.phone    || '',
        initials: auth.user.initials || '',
        language: localStorage.getItem('nexa.lang') || 'es',
      });
    }
  }

  async function save(payload) {
    loading.value = true;
    saved.value   = false;
    try {
      Object.assign(profile.value, payload);
      if (payload.language) {
        localStorage.setItem('nexa.lang', payload.language);
      }
      saved.value = true;
      setTimeout(() => { saved.value = false; }, 3000);
    } finally {
      loading.value = false;
    }
  }

  async function changePassword() {
    pwSaved.value = true;
    setTimeout(() => { pwSaved.value = false; }, 3000);
  }

  return { profile, loading, saved, pwSaved, loadFromAuth, save, changePassword };
});
