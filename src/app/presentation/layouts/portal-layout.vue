<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import BuyerAssistantPreview from '@/sales/presentation/buyer-portal/components/buyer-assistant-preview.vue';
import i18n from '@/i18n';
import logo from '@/assets/img/nexa.svg';

const { t, locale } = useI18n();
const route  = useRoute();
const router = useRouter();
const toast  = useToast();
const cart   = useCartStore();
const auth   = useAuthStore();
const ds     = useDataStore();
const mobileMenuOpen = ref(false);

const navItems = [
  { to: '/portal/home', labelKey: 'portal.nav.home', icon: 'pi-home' },
  { to: '/portal/product-catalog', labelKey: 'portal.nav.catalog', icon: 'pi-box' },
  { to: '/portal/request-builder', labelKey: 'portal.nav.requestBuilder', icon: 'pi-shopping-cart' },
  { to: '/portal/purchase-requests', labelKey: 'portal.nav.requests', icon: 'pi-inbox' },
  { to: '/portal/purchase-orders', labelKey: 'portal.nav.orders', icon: 'pi-truck' },
  { to: '/portal/business-documents', labelKey: 'portal.nav.documents', icon: 'pi-file-check' },
  { to: '/portal/payment-methods', labelKey: 'portal.nav.payments', icon: 'pi-credit-card' },
  { to: '/portal/premium', labelKey: 'portal.nav.premium', icon: 'pi-sparkles' },
  { to: '/portal/profile', labelKey: 'portal.nav.profile', icon: 'pi-user-edit' },
];

const bottomNavItems = computed(() => navItems.slice(0, 4));
const mobileMenuItems = computed(() => navItems.slice(4));
const footerLinks = computed(() => [
  { to: '/portal/legal/terms', label: t('footer.terms') },
  { to: '/portal/legal/privacy', label: t('footer.privacy') },
  { to: '/portal/support', label: t('footer.support') },
]);

function setLang(l) {
  locale.value = l;
  i18n.global.locale.value = l;
  localStorage.setItem('nexa.lang', l);
}

function goPortal(to) {
  mobileMenuOpen.value = false;
  router.push(to);
}

function goRequestBuilder() {
  const clientId = auth.user?.clientId;
  if (!clientId) {
    toast.add({ severity: 'warn', summary: t('common.noClientAccount'), detail: t('common.noClientAccountDesc'), life: 3500 });
    router.push({ name: 'auth.forbidden', query: { required: 'portal' } });
    return;
  }
  cart.toggle();
  router.push('/portal/request-builder');
}
</script>

<template>
  <div class="portal-shell">
    <header class="portal-topbar" role="banner">
      <img :src="logo" alt="Nexa" style="width:82px;height:auto;display:block" />
      <nav class="portal-nav" role="navigation" :aria-label="t('portal.catalog')">
        <button
          v-for="n in navItems"
          :key="n.to"
          class="portal-nav-item"
          :class="{ active: route.path.startsWith(n.to) }"
          :aria-current="route.path.startsWith(n.to) ? 'page' : undefined"
          @click="router.push(n.to)"
        >
          {{ t(n.labelKey) }}
        </button>
      </nav>
      <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
        <!-- Language switcher -->
        <div style="display:flex;gap:2px" role="group" :aria-label="t('common.language')">
          <button class="lang-opt" :class="{ active: locale === 'es' }" @click="setLang('es')" :aria-pressed="locale === 'es'" style="padding:3px 8px;font-size:11px">ES</button>
          <button class="lang-opt" :class="{ active: locale === 'en' }" @click="setLang('en')" :aria-pressed="locale === 'en'" style="padding:3px 8px;font-size:11px">EN</button>
        </div>
        <button class="cart-btn" @click="cart.toggle()" :aria-label="`${t('portal.cart')} (${cart.count})`">
          <i class="pi pi-shopping-cart" aria-hidden="true"></i>
          {{ t('portal.cart') }}
          <span class="cart-count" v-if="cart.count" aria-live="polite">{{ cart.count }}</span>
        </button>
        <button
          class="portal-menu-btn"
          type="button"
          :aria-label="t('portal.nav.more')"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i class="pi pi-bars" aria-hidden="true"></i>
        </button>
      </div>
    </header>

    <main class="portal-page" role="main">
      <router-view />
    </main>

    <!-- Terms footer -->
    <footer class="portal-footer" role="contentinfo">
      <span>{{ t('footer.rights') }}</span>
      <nav class="portal-footer-links" aria-label="Portal legal links">
        <button
          v-for="link in footerLinks"
          :key="link.to"
          type="button"
          class="portal-footer-link"
          @click="goPortal(link.to)"
        >
          {{ link.label }}
        </button>
      </nav>
    </footer>

    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="portal-mobile-menu-backdrop"
        @click="mobileMenuOpen = false"
        aria-hidden="true"
      ></div>
    </transition>

    <nav
      class="portal-mobile-menu"
      :class="{ open: mobileMenuOpen }"
      role="navigation"
      :aria-label="t('portal.nav.more')"
    >
      <button
        v-for="n in mobileMenuItems"
        :key="n.to"
        type="button"
        class="portal-mobile-menu-item"
        :class="{ active: route.path.startsWith(n.to) }"
        :aria-current="route.path.startsWith(n.to) ? 'page' : undefined"
        @click="goPortal(n.to)"
      >
        <i :class="['pi', n.icon]" aria-hidden="true"></i>
        <span>{{ t(n.labelKey) }}</span>
      </button>
    </nav>

    <nav class="portal-bottom-nav" role="navigation" :aria-label="t('common.mobileNav')">
      <button
        v-for="n in bottomNavItems"
        :key="n.to"
        class="portal-bottom-nav-item"
        :class="{ active: route.path.startsWith(n.to) }"
        :aria-current="route.path.startsWith(n.to) ? 'page' : undefined"
        @click="goPortal(n.to)"
      >
        <i
          :class="['pi', n.icon]"
          aria-hidden="true"
        ></i>
        <span>{{ t(n.labelKey) }}</span>
      </button>
      <button
        type="button"
        class="portal-bottom-nav-item"
        :class="{ active: mobileMenuItems.some(n => route.path.startsWith(n.to)) }"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <i class="pi pi-bars" aria-hidden="true"></i>
        <span>{{ t('portal.nav.more') }}</span>
      </button>
    </nav>

    <!-- Cart drawer -->
    <transition name="fade">
      <div v-if="cart.isOpen" class="drawer-overlay" @click.self="cart.toggle()" aria-hidden="true"></div>
    </transition>
    <aside v-if="cart.isOpen" class="drawer open" role="dialog" :aria-label="t('portal.cart')" aria-modal="true">
      <div class="drawer-header">
        <div class="drawer-title">{{ t('portal.cart') }} ({{ cart.count }})</div>
        <button class="btn btn-ghost btn-sm" @click="cart.toggle()" :aria-label="t('portal.cartClose')"><i class="pi pi-times" aria-hidden="true"></i></button>
      </div>
      <div class="drawer-body">
        <div v-if="!cart.items.length" class="empty-state">
          <div class="empty-state-icon"><i class="pi pi-shopping-cart" aria-hidden="true"></i></div>
          <div class="empty-state-title">{{ t('portal.emptyCart') }}</div>
          <div class="empty-state-desc">{{ t('portal.emptyCartDesc') }}</div>
        </div>
        <div v-for="i in cart.items" :key="i.productId" style="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid #F3F0EC">
          <div :class="'product-placeholder cat-' + i.cat" style="width:60px;height:60px;border-radius:8px;flex-shrink:0">
            <img v-if="i.imageUrl" class="catalog-product-image" :src="i.imageUrl" :alt="i.name" loading="lazy" />
            <div v-else class="pp-icon" style="font-size:20px"><i class="pi pi-box" aria-hidden="true"></i></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">{{ i.name }}</div>
            <div style="font-size:11px;color:#9CA3AF">S/ {{ i.price.toFixed(2) }} / {{ i.unit }}</div>
            <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
              <button class="btn btn-ghost btn-sm" style="padding:2px 8px" @click="cart.setQty(i.productId, i.qty - 1)" :aria-label="t('portal.cartDecrease', { name: i.name })">−</button>
              <span style="font-size:13px;font-weight:600;min-width:24px;text-align:center" :aria-label="t('portal.cartQuantity', { qty: i.qty })">{{ i.qty }}</span>
              <button class="btn btn-ghost btn-sm" style="padding:2px 8px" @click="cart.setQty(i.productId, i.qty + 1)" :aria-label="t('portal.cartIncrease', { name: i.name })">+</button>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="cart.remove(i.productId)" :aria-label="t('portal.cartRemove', { name: i.name })"><i class="pi pi-trash" aria-hidden="true"></i></button>
            </div>
          </div>
          <div style="font-weight:700;font-size:13px">S/ {{ (i.qty * i.price).toFixed(2) }}</div>
        </div>
      </div>
      <div class="drawer-footer" v-if="cart.items.length" style="flex-direction:column;gap:12px;align-items:stretch">
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px">
          <span>{{ t('portal.total') }}</span><span>S/ {{ cart.total.toFixed(2) }}</span>
        </div>
        <button class="btn btn-primary" style="justify-content:center" @click="goRequestBuilder">
          <i class="pi pi-send" aria-hidden="true"></i> {{ t('portal.submitRequest') }}
        </button>
      </div>
    </aside>

    <BuyerAssistantPreview />
  </div>
</template>
