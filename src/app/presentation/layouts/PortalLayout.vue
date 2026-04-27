<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useCartStore } from '@/app/application/stores/cart.store';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import i18n from '@/i18n';
import logo from '@/assets/img/nexa.svg';

const { t, locale } = useI18n();
const route  = useRoute();
const router = useRouter();
const toast  = useToast();
const cart   = useCartStore();
const auth   = useAuthStore();
const ds     = useDataStore();
const WEBSITE_BASE = 'https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website';

const footerLinks = {
  terms: `${WEBSITE_BASE}/pages/legal/terms.html`,
  privacy: `${WEBSITE_BASE}/pages/legal/privacy.html`,
  support: `${WEBSITE_BASE}/pages/company.html#contact`,
};

const navItems = [
  { to: '/portal/home',    labelKey: 'portal.home' },
  { to: '/portal/catalog', labelKey: 'portal.catalog' },
  { to: '/portal/orders',  labelKey: 'portal.myOrders' },
];

function logout() { auth.logout(); router.push('/auth/login'); }

function setLang(l) {
  locale.value = l;
  i18n.global.locale.value = l;
  localStorage.setItem('nexa.lang', l);
}

function placeOrder() {
  const clientId = auth.user?.clientId;
  if (!clientId) {
    toast.add({ severity: 'warn', summary: t('common.noClientAccount'), detail: t('common.noClientAccountDesc'), life: 3500 });
    router.push({ name: 'auth.forbidden', query: { required: 'portal' } });
    return;
  }

  const itemCount = cart.count;
  const total     = cart.total;
  const newId     = ds.nextOrderId();
  const today     = new Date().toISOString().slice(0, 10);
  ds.addOrder({
    id:       newId,
    clientId,
    status:   'validating',
    priority: 'medium',
    date:     today,
    items:    cart.items.map(i => ({
      productId: i.productId,
      qty:       i.qty,
      price:     i.price,
      stockOk:   true,
    })),
    total,
    notes: '',
  });
  cart.clear();
  cart.toggle();
  router.push({ name: 'portal.orders.success', query: { orderId: newId, total: total.toFixed(2), items: itemCount } });
}
</script>

<template>
  <div>
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
        <div class="avatar" @click="logout" @keydown.enter.prevent="logout" @keydown.space.prevent="logout" :title="t('common.logout')" role="button" tabindex="0" :aria-label="t('common.logout')">
          {{ auth.user?.initials || 'CL' }}
        </div>
      </div>
    </header>

    <main class="portal-page" role="main">
      <router-view />
    </main>

    <!-- Terms footer -->
    <footer class="portal-footer" role="contentinfo">
      <span>{{ t('footer.rights') }}</span>
      <div class="portal-footer-links">
        <a :href="footerLinks.terms" target="_blank" rel="noopener">{{ t('footer.terms') }}</a>
        <a :href="footerLinks.privacy" target="_blank" rel="noopener">{{ t('footer.privacy') }}</a>
        <a :href="footerLinks.support" target="_blank" rel="noopener">{{ t('footer.support') }}</a>
      </div>
    </footer>

    <!-- Cart drawer -->
    <transition name="fade">
      <div v-if="cart.isOpen" class="drawer-overlay" @click.self="cart.toggle()" aria-hidden="true"></div>
    </transition>
    <aside v-if="cart.isOpen" class="drawer open" role="dialog" :aria-label="t('portal.cart')" aria-modal="true">
      <div class="drawer-header">
        <div class="drawer-title">{{ t('portal.cart') }} ({{ cart.count }})</div>
        <button class="btn btn-ghost btn-sm" @click="cart.toggle()" :aria-label="'Cerrar carrito'"><i class="pi pi-times" aria-hidden="true"></i></button>
      </div>
      <div class="drawer-body">
        <div v-if="!cart.items.length" class="empty-state">
          <div class="empty-state-icon"><i class="pi pi-shopping-cart" aria-hidden="true"></i></div>
          <div class="empty-state-title">{{ t('portal.emptyCart') }}</div>
          <div class="empty-state-desc">{{ t('portal.emptyCartDesc') }}</div>
        </div>
        <div v-for="i in cart.items" :key="i.productId" style="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid #F3F0EC">
          <div :class="'product-placeholder cat-' + i.cat" style="width:60px;height:60px;border-radius:8px;flex-shrink:0">
            <div class="pp-icon" style="font-size:20px"><i class="pi pi-box" aria-hidden="true"></i></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">{{ i.name }}</div>
            <div style="font-size:11px;color:#9CA3AF">S/ {{ i.price.toFixed(2) }} / {{ i.unit }}</div>
            <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
              <button class="btn btn-ghost btn-sm" style="padding:2px 8px" @click="cart.setQty(i.productId, i.qty - 1)" :aria-label="`Reducir cantidad de ${i.name}`">−</button>
              <span style="font-size:13px;font-weight:600;min-width:24px;text-align:center" :aria-label="`Cantidad: ${i.qty}`">{{ i.qty }}</span>
              <button class="btn btn-ghost btn-sm" style="padding:2px 8px" @click="cart.setQty(i.productId, i.qty + 1)" :aria-label="`Aumentar cantidad de ${i.name}`">+</button>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="cart.remove(i.productId)" :aria-label="`Eliminar ${i.name} del carrito`"><i class="pi pi-trash" aria-hidden="true"></i></button>
            </div>
          </div>
          <div style="font-weight:700;font-size:13px">S/ {{ (i.qty * i.price).toFixed(2) }}</div>
        </div>
      </div>
      <div class="drawer-footer" v-if="cart.items.length" style="flex-direction:column;gap:12px;align-items:stretch">
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px">
          <span>{{ t('portal.total') }}</span><span>S/ {{ cart.total.toFixed(2) }}</span>
        </div>
        <button class="btn btn-primary" style="justify-content:center" @click="placeOrder">
          <i class="pi pi-check" aria-hidden="true"></i> {{ t('portal.placeOrder') }}
        </button>
      </div>
    </aside>
  </div>
</template>
