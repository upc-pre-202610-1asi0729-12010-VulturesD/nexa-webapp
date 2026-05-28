import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { iamApplication } from '@/iam/application/iam.application';

export const useAuthStore = defineStore('auth', () => {
  const storedUser = JSON.parse(localStorage.getItem('nexa.user') || 'null');
  const hiddenAdminSession = storedUser?.roleKey === 'admin' || storedUser?.segment === 'ADMIN';
  if (hiddenAdminSession) {
    localStorage.removeItem('nexa.user');
    localStorage.removeItem('nexa.token');
    localStorage.removeItem('nexa.scope');
  }

  const user  = ref(hiddenAdminSession ? null : storedUser);
  const token = ref(hiddenAdminSession ? null : localStorage.getItem('nexa.token') || null);
  const scope = ref(hiddenAdminSession ? 'ops' : localStorage.getItem('nexa.scope') || 'ops');
  const demoUsers = ref([]);

  const isAuthenticated = computed(() => !!token.value);

  async function login({ email, password }) {
    if (!email || !password) throw new Error('Missing credentials');

    const found = await iamApplication.verifyCredentials(email, password);

    if (!found) throw new Error('Invalid credentials');
    if (found.roleKey === 'admin' || found.segment === 'ADMIN') {
      throw new Error('Admin demo access is hidden in v1. Use a commercial, operations or buyer demo profile.');
    }

    const sessionUser = {
      id:         found.id,
      name:       found.name,
      email:      found.email,
      initials:   found.initials,
      clientId:   found.clientId || null,
      roleKey:    found.roleKey || 'commercial',
      roleName:   found.roleName || 'Operator',
      department: found.department || '',
      phone:      found.phone || '',
      preferredLanguage: found.preferredLanguage || found.locale || 'en',
      planAccess: found.planAccess || 'standard',
      notificationPreferences: found.notificationPreferences || {},
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
