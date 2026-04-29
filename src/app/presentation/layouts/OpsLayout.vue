<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { useAuthStore } from '@/iam/application/iam.store';
import i18n from '@/i18n';
import logo from '@/assets/img/nexa.svg';

const { t, locale } = useI18n();
const route  = useRoute();
const router = useRouter();
const ds     = useDataStore();
const auth   = useAuthStore();

const roleKey = computed(() => auth.user?.roleKey || 'commercial');

const navAll = [
  { to: '/ops/dashboard', icon: 'pi-th-large',   label: () => t('nav.dashboard'),    section: 'main',       roles: ['commercial', 'logistics', 'admin'] },
  { to: '/ops/catalog',   icon: 'pi-box',         label: () => t('nav.catalog'),      section: 'main',       roles: ['commercial', 'logistics', 'admin'] },
  { to: '/ops/inventory', icon: 'pi-database',    label: () => t('nav.inventory'),    section: 'main',       roles: ['logistics', 'admin'] },
  { to: '/ops/orders',    icon: 'pi-file-edit',   label: () => t('nav.orders'),       section: 'commercial', roles: ['commercial', 'logistics', 'admin'], badge: () => ds.D.orders.filter(o => ['validating','blocked'].includes(o.status)).length },
  { to: '/ops/orders/new',icon: 'pi-plus-circle', label: () => t('nav.createOrder'),  section: 'commercial', roles: ['commercial', 'logistics', 'admin'] },
  { to: '/ops/clients',   icon: 'pi-users',       label: () => t('nav.clients'),      section: 'commercial', roles: ['commercial', 'logistics', 'admin'] },
  { to: '/ops/dispatch',  icon: 'pi-send',       label: () => t('nav.dispatch'),  section: 'operations', roles: ['logistics', 'admin'] },
  { to: '/ops/reports',   icon: 'pi-chart-bar',  label: () => t('nav.reports'),   section: 'operations', roles: ['commercial', 'logistics', 'admin'] },
  { to: '/ops/settings',  icon: 'pi-cog',        label: () => t('nav.settings'),  section: 'operations', roles: ['admin'] },
  { to: '/ops/profile',   icon: 'pi-user-edit',  label: () => t('nav.profile'),   section: 'operations', roles: ['commercial', 'logistics', 'admin'] },
];

const navMain = computed(() =>
  navAll
    .filter(item => item.roles.includes(roleKey.value))
    .map(item => ({ ...item, label: item.label() }))
);

const sections = computed(() => {
  const all = [
    { key: 'main',        label: t('nav.main') },
    { key: 'commercial',  label: t('nav.commercial') },
    { key: 'operations',  label: t('nav.operations') },
  ];
  return all.filter(sec => navMain.value.some(n => n.section === sec.key));
});

function isNavActive(item) {
  const p = route.path;
  if (item.to === '/ops/orders') {
    return p === '/ops/orders' || (p.startsWith('/ops/orders/') && p !== '/ops/orders/new');
  }
  return p === item.to || (item.to !== '/ops/dashboard' && p.startsWith(item.to + '/'));
}

const screenTitle = computed(() => {
  const map = {
    'ops.dashboard':    t('nav.dashboard'),
    'ops.catalog':      t('nav.catalog'),
    'ops.inventory':    t('nav.inventory'),
    'ops.orders':       t('nav.orders'),
    'ops.orders.new':   t('nav.createOrder'),
    'ops.orders.detail': t('nav.orderDetail'),
    'ops.dispatch':     t('nav.dispatch'),
    'ops.reports':      t('nav.reports'),
    'ops.clients':      t('nav.clients'),
    'ops.settings':     t('nav.settings'),
    'ops.profile':      t('nav.profile'),
  };
  return map[route.name] || 'Nexa Ops';
});

function setLang(l) {
  locale.value = l;
  i18n.global.locale.value = l;
  localStorage.setItem('nexa.lang', l);
}

function logout() {
  auth.logout();
  router.push('/auth/login');
}
</script>

<template>
  <div id="ops-app" style="display:flex;height:100vh;overflow:hidden;width:100%;flex:1">

    <!-- Sidebar -->
    <nav class="sidebar" role="navigation" :aria-label="t('nav.main')">
      <div class="sidebar-logo">
        <img :src="logo" alt="Nexa" />
      </div>
      <div class="sidebar-nav">
        <template v-for="sec in sections" :key="sec.key">
          <div class="nav-section" role="separator">{{ sec.label }}</div>
          <button
            v-for="item in navMain.filter(n => n.section === sec.key)"
            :key="item.to"
            class="nav-item"
            :class="{ active: isNavActive(item) }"
            :aria-current="isNavActive(item) ? 'page' : undefined"
            @click="router.push(item.to)"
          >
            <i :class="'pi ' + item.icon" aria-hidden="true"></i>
            {{ item.label }}
            <span v-if="item.badge && item.badge() > 0" class="nav-count" :aria-label="`${item.badge()} ${t('common.pending')}`">{{ item.badge() }}</span>
          </button>
        </template>
      </div>
      <div class="sidebar-footer">
        <div class="user-chip" @click="logout" :title="t('common.logout')" role="button" tabindex="0" :aria-label="t('common.logout')">
          <div class="avatar">{{ auth.user?.initials || 'NX' }}</div>
          <div>
            <div class="user-name">{{ auth.user?.name || ds.D.user.name }}</div>
            <div class="user-role">{{ auth.user?.roleName || ds.D.user.role }}</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main -->
    <div class="main">
      <header class="topbar" role="banner">
        <div class="topbar-title">{{ screenTitle }}</div>
        <div style="font-size:12px;color:#9CA3AF;margin-left:8px">{{ ds.D.company.name }}</div>
        <div class="topbar-right">
          <!-- Language switcher -->
          <div style="display:flex;gap:2px;margin-right:4px" role="group" :aria-label="t('common.language')">
            <button
              class="lang-opt"
              :class="{ active: locale === 'es' }"
              @click="setLang('es')"
              :aria-pressed="locale === 'es'"
              style="padding:3px 8px;font-size:11px"
            >ES</button>
            <button
              class="lang-opt"
              :class="{ active: locale === 'en' }"
              @click="setLang('en')"
              :aria-pressed="locale === 'en'"
              style="padding:3px 8px;font-size:11px"
            >EN</button>
          </div>
          <button class="topbar-icon-btn" :aria-label="t('common.notifications')">
            <i class="pi pi-bell" aria-hidden="true"></i>
            <div class="notif-dot"></div>
          </button>
          <div class="avatar" @click="router.push('/ops/profile')" :title="t('nav.profile')" role="button" tabindex="0" :aria-label="t('nav.profile')">
            {{ auth.user?.initials || 'MF' }}
          </div>
        </div>
      </header>

      <main class="page" role="main" :aria-label="t('common.mainContent')">
        <router-view />
      </main>
    </div>

    <!-- Mobile nav -->
    <nav class="mobile-nav" role="navigation" :aria-label="t('common.mobileNav')">
      <div class="mobile-nav-inner">
        <button class="mobile-nav-item" :class="{ active: route.path === '/ops/dashboard' }" @click="router.push('/ops/dashboard')" :aria-current="route.path === '/ops/dashboard' ? 'page' : undefined"><i class="pi pi-th-large" aria-hidden="true"></i>{{ t('nav.dashboard') }}</button>
        <button class="mobile-nav-item" :class="{ active: route.path === '/ops/catalog' }" @click="router.push('/ops/catalog')" :aria-current="route.path === '/ops/catalog' ? 'page' : undefined"><i class="pi pi-box" aria-hidden="true"></i>{{ t('nav.catalog') }}</button>
        <button class="mobile-nav-item" :class="{ active: isNavActive({ to: '/ops/orders' }) }" @click="router.push('/ops/orders')" :aria-current="isNavActive({ to: '/ops/orders' }) ? 'page' : undefined"><i class="pi pi-file-edit" aria-hidden="true"></i>{{ t('nav.orders') }}</button>
        <button v-if="roleKey === 'logistics' || roleKey === 'admin'" class="mobile-nav-item" :class="{ active: route.path === '/ops/dispatch' }" @click="router.push('/ops/dispatch')" :aria-current="route.path === '/ops/dispatch' ? 'page' : undefined"><i class="pi pi-send" aria-hidden="true"></i>{{ t('nav.dispatch') }}</button>
        <button class="mobile-nav-item" :class="{ active: route.path === '/ops/orders/new' }" @click="router.push('/ops/orders/new')" :aria-current="route.path === '/ops/orders/new' ? 'page' : undefined"><i class="pi pi-plus-circle" aria-hidden="true"></i>{{ t('common.create') }}</button>
      </div>
    </nav>
  </div>
</template>
