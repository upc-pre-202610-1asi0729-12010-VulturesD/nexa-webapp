import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { iamApplication } from '@/iam/application/iam.application';

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('nexa.user') || 'null'));
  const token = ref(localStorage.getItem('nexa.token') || null);
  const scope = ref(localStorage.getItem('nexa.scope') || 'ops');
  const demoUsers = ref([]);

  const isAuthenticated = computed(() => !!token.value);

  async function login({ email, password }) {
    if (!email || !password) throw new Error('Faltan credenciales');

    const found = await iamApplication.verifyCredentials(email, password);

    if (!found) throw new Error('Credenciales inválidas');

    const sessionUser = {
      id:         found.id,
      name:       found.name,
      email:      found.email,
      initials:   found.initials,
      clientId:   found.clientId || null,
      roleKey:    found.roleKey || 'commercial',
      roleName:   found.roleName || 'Operador',
      department: found.department || '',
    };

    scope.value = found.scope || found.role || 'ops';
    user.value  = sessionUser;
    token.value = 'demo.' + btoa(email).slice(0, 12);
    localStorage.setItem('nexa.user',  JSON.stringify(sessionUser));
    localStorage.setItem('nexa.token', token.value);
    localStorage.setItem('nexa.scope', scope.value);
  }

  function logout() {
    user.value  = null;
    token.value = null;
    scope.value = 'ops';
    localStorage.removeItem('nexa.user');
    localStorage.removeItem('nexa.token');
    localStorage.removeItem('nexa.scope');
  }

  async function loadDemoUsers() {
    demoUsers.value = await iamApplication.getUsers();
    return demoUsers.value;
  }

  return { user, token, scope, demoUsers, isAuthenticated, login, logout, loadDemoUsers };
});
