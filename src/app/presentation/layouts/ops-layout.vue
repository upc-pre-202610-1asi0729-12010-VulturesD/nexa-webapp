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
const dashboardTo = computed(() => {
  if (roleKey.value === 'logistics') return '/ops/operations/dashboard';
  return '/ops/commercial/dashboard';
});

const navAll = computed(() => [
  { to: dashboardTo.value, icon: 'pi-th-large', label: () => t('nav.dashboard'), section: 'main', roles: ['commercial', 'logistics'] },
  { to: '/ops/product-catalog', icon: 'pi-box', label: () => t('nav.catalog'), section: 'main', roles: ['commercial'] },
  { to: '/ops/commercial/purchase-requests', icon: 'pi-inbox', label: () => t('nav.requests'), section: 'commercial', roles: ['commercial'], badge: () => ds.D.purchaseRequests.filter(r => ['submitted', 'in_review', 'needs_adjustment'].includes(r.status)).length },
  { to: '/ops/commercial/purchase-orders', icon: 'pi-file-edit', label: () => t('nav.orders'), section: 'commercial', roles: ['commercial'], badge: () => ds.D.purchaseOrders.filter(o => ['pending', 'validating', 'blocked', 'document_pending'].includes(o.status)).length },
  { to: '/ops/commercial/manual-order-entry', icon: 'pi-plus-circle', label: () => t('nav.createOrder'), section: 'commercial', roles: ['commercial'] },
  { to: '/ops/commercial/client-accounts', icon: 'pi-users', label: () => t('nav.clients'), section: 'commercial', roles: ['commercial'] },
  { to: '/ops/commercial/business-documents', icon: 'pi-file-check', label: () => t('nav.documents'), section: 'commercial', roles: ['commercial'], badge: () => ds.D.businessDocuments.filter(d => d.required && ['pending', 'observed', 'rejected'].includes(d.status)).length },
  { to: '/ops/operations/inventory-control', icon: 'pi-database', label: () => t('nav.inventory'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/operations/dispatch-orders', icon: 'pi-send', label: () => t('nav.dispatchBoard'), section: 'operations', roles: ['logistics'], badge: () => ds.D.dispatchOrders.filter(d => !['delivered'].includes(d.status)).length },
  { to: '/ops/operations/proof-of-delivery', icon: 'pi-camera', label: () => t('nav.evidence'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/operations/operational-analytics', icon: 'pi-chart-bar', label: () => t('nav.operationalAnalytics'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/operations/business-documents', icon: 'pi-file-check', label: () => t('nav.documents'), section: 'operations', roles: ['logistics'], badge: () => ds.D.businessDocuments.filter(d => d.required && ['pending', 'observed', 'rejected'].includes(d.status)).length },
  { to: '/ops/operations/promotions', icon: 'pi-megaphone', label: () => t('nav.promotions'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/operations/customer-portals', icon: 'pi-upload', label: () => t('nav.customerPortals'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/operations/company-administration', icon: 'pi-building', label: () => t('nav.companyAdministration'), section: 'operations', roles: ['logistics'] },
  { to: '/ops/profile', icon: 'pi-user-edit', label: () => t('nav.profile'), section: 'operations', roles: ['commercial', 'logistics'] },
]);

const navMain = computed(() =>
  navAll.value
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

const mobileItems = computed(() => {
  const pendingOrders = ds.D.purchaseOrders.filter(o => ['pending', 'validating', 'blocked', 'document_pending'].includes(o.status)).length;
  const openDispatches = ds.D.dispatchOrders.filter(d => !['delivered'].includes(d.status)).length;
  if (roleKey.value === 'logistics') {
    return [
      { to: dashboardTo.value, icon: 'pi-th-large', label: t('nav.dashboard') },
      { to: '/ops/operations/inventory-control', icon: 'pi-database', label: t('nav.inventory') },
      { to: '/ops/operations/dispatch-orders', icon: 'pi-send', label: t('nav.dispatchBoard'), badge: openDispatches },
      { to: '/ops/operations/proof-of-delivery', icon: 'pi-camera', label: t('nav.evidence') },
      { to: '/ops/operations/company-administration', icon: 'pi-building', label: t('nav.companyAdministration') },
    ];
  }
  return [
    { to: dashboardTo.value, icon: 'pi-th-large', label: t('nav.dashboard') },
    { to: '/ops/product-catalog', icon: 'pi-box', label: t('nav.catalog') },
    { to: '/ops/commercial/purchase-requests', icon: 'pi-inbox', label: t('nav.requests') },
    { to: '/ops/commercial/purchase-orders', icon: 'pi-file-edit', label: t('nav.orders'), badge: pendingOrders },
    { to: '/ops/commercial/manual-order-entry', icon: 'pi-plus-circle', label: t('nav.createOrder') },
  ];
});

function isNavActive(item) {
  const p = route.path;
  if (item.to === '/ops/commercial/purchase-orders') {
    return p === '/ops/commercial/purchase-orders' || p.startsWith('/ops/commercial/purchase-orders/');
  }
  if (item.to === '/ops/operations/dispatch-orders') {
    return p === '/ops/operations/dispatch-orders' || p.startsWith('/ops/operations/dispatch-orders/');
  }
  return p === item.to || (item.to !== '/ops/dashboard' && p.startsWith(item.to + '/'));
}

const companyLegalName = computed(() => ds.D.company.legalName || 'Importaciones y Comercio Internacional S.A.');
const companyDisplayName = computed(() => ds.D.company.name || 'Nexa');
const companyInitials = computed(() => (companyDisplayName.value || 'ICISA').slice(0, 2).toUpperCase());

function setLang(l) {
  locale.value = l;
  i18n.global.locale.value = l;
  localStorage.setItem('nexa.lang', l);
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
        <div
          class="user-chip"
          @click="router.push('/ops/profile')"
          @keydown.enter.prevent="router.push('/ops/profile')"
          @keydown.space.prevent="router.push('/ops/profile')"
          :title="t('nav.profile')"
          role="button"
          tabindex="0"
          aria-label="Open profile settings"
        >
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
        <div class="topbar-company" aria-label="Company identity">
          <div class="company-mark">{{ companyInitials }}</div>
          <div class="topbar-company-copy">
            <div class="topbar-company-name">{{ companyLegalName }}</div>
            <div class="topbar-company-meta">{{ companyDisplayName }}</div>
          </div>
        </div>
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
        </div>
      </header>

      <main class="page" role="main" :aria-label="t('common.mainContent')">
        <router-view />
      </main>
    </div>

    <!-- Mobile nav -->
    <nav class="mobile-nav" role="navigation" :aria-label="t('common.mobileNav')">
      <div class="mobile-nav-inner">
        <button
          v-for="item in mobileItems"
          :key="item.to"
          class="mobile-nav-item"
          :class="{ active: isNavActive(item) }"
          @click="router.push(item.to)"
          :aria-current="isNavActive(item) ? 'page' : undefined"
        >
          <i :class="'pi ' + item.icon" aria-hidden="true"></i>{{ item.label }}
          <span v-if="item.badge" class="mobile-nav-count">{{ item.badge }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
