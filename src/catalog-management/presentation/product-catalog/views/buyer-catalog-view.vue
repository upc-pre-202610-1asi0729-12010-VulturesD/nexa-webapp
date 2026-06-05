<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { coldTypeLabel, coldTypeBadge } from '@/shared/status';
import { CATALOG_BRANDS, brandForProduct } from '@/catalog-management/application/product-catalog/product-brand';

const router = useRouter();
const { t } = useI18n();
const ds = useDataStore();
const cart = useCartStore();
const D = ds.D;

const search = ref('');
const category = ref('all');
const coldType = ref('all');
const brand = ref('all');
const onlyOffers = ref(false);
const brandExpanded = ref(false);

const categories = computed(() => ['all', ...new Set(D.products.filter(p => p.isVisibleToBuyer).map(p => p.category))]);
const coldTypes = ['all', 'frozen', 'chilled', 'ambient'];
const brands = computed(() => ['all', ...CATALOG_BRANDS, ...new Set(D.products.map(product => brandForProduct(product)).filter(item => item && item !== 'Brand pending' && !CATALOG_BRANDS.includes(item)))]);

const filtered = computed(() => {
  let rows = D.products.filter(product => product.isVisibleToBuyer && product.status !== 'out');
  if (category.value !== 'all') rows = rows.filter(product => product.category === category.value);
  if (coldType.value !== 'all') rows = rows.filter(product => product.coldType === coldType.value);
  if (brand.value !== 'all') rows = rows.filter(product => brandForProduct(product) === brand.value);
  if (onlyOffers.value) rows = rows.filter(product => ds.promotionsForProduct(product.id).length);
  if (search.value) {
    const q = search.value.toLowerCase();
    rows = rows.filter(product =>
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      brandForProduct(product).toLowerCase().includes(q)
    );
  }
  return rows;
});

const isInCart = (id) => cart.items.some(item => item.productId === id);
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">{{ t('portal.nav.catalog') }}</div>
      <div class="page-subtitle">{{ t('catalog.authorizedProducts', { count: filtered.length }) }}</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/portal/request-builder')">
      <i class="pi pi-shopping-cart"></i> {{ t('catalog.requestBuilderCount', { count: cart.count }) }}
    </button>
  </div>

  <div class="catalog-layout">
    <aside class="catalog-filter-panel" :aria-label="t('catalog.filters')">
      <div class="search-input catalog-search">
        <i class="pi pi-search"></i>
        <input v-model="search" :placeholder="t('catalog.searchFullPlaceholder')" />
      </div>

      <section class="catalog-filter-section">
        <div class="catalog-filter-title">{{ t('catalog.categories') }}</div>
        <button v-for="item in categories" :key="item" class="catalog-filter-option" :class="{ active: category === item }" @click="category = item">
          {{ item === 'all' ? t('catalog.allCategories') : item }}
        </button>
      </section>

      <section class="catalog-filter-section">
        <div class="catalog-filter-title">{{ t('catalog.coldType') }}</div>
        <button v-for="item in coldTypes" :key="item" class="catalog-filter-option" :class="{ active: coldType === item }" @click="coldType = item">
          {{ item === 'all' ? t('catalog.allColdTypes') : coldTypeLabel(item) }}
        </button>
      </section>

      <section class="catalog-filter-section">
        <button class="catalog-filter-heading" type="button" @click="brandExpanded = !brandExpanded" :aria-expanded="brandExpanded">
          <span>{{ t('catalog.brand') }}</span>
          <i :class="['pi', brandExpanded ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
        </button>
        <button class="catalog-filter-option" :class="{ active: brand === 'all' }" @click="brand = 'all'">{{ t('catalog.allBrands') }}</button>
        <div v-if="brandExpanded" class="catalog-filter-collapsible">
          <button v-for="item in brands.filter(item => item !== 'all')" :key="item" class="catalog-filter-option" :class="{ active: brand === item }" @click="brand = item">
            {{ item }}
          </button>
        </div>
      </section>

      <section class="catalog-filter-section">
        <button class="catalog-filter-option" :class="{ active: onlyOffers }" @click="onlyOffers = !onlyOffers">
          <i class="pi pi-tag"></i> {{ t('catalog.offers') }}
        </button>
      </section>
    </aside>

    <div class="grid-4 catalog-product-grid">
      <article v-for="product in filtered" :key="product.id" class="buyer-card">
      <div class="buyer-product-visual" :class="'cat-' + product.cat" @click="router.push('/portal/product-catalog/' + product.id)" style="cursor:pointer">
        <i class="pi pi-box"></i>
        <span v-if="ds.promotionsForProduct(product.id).length" class="flow-pill flow-pill-amber" style="position:absolute;left:12px;top:12px">
          {{ t('catalog.offer') }}
        </span>
      </div>
      <div style="padding:14px">
        <div class="flow-row-between" style="align-items:flex-start;gap:8px">
          <div>
            <div style="font-size:14px;font-weight:800;color:#0F172A;line-height:1.25">{{ product.name }}</div>
            <div class="mono" style="font-size:10px;margin-top:4px">{{ product.sku }}</div>
            <div class="catalog-brand-line">{{ t('catalog.brandLine', { brand: brandForProduct(product) }) }}</div>
          </div>
          <button
            :class="'add-btn ' + (isInCart(product.id) ? 'add-btn-added' : 'add-btn-default')"
            @click="cart.add(product)"
            :aria-label="isInCart(product.id) ? t('catalog.inRequest') : t('catalog.addToRequest')"
          >
            <i :class="isInCart(product.id) ? 'pi pi-check' : 'pi pi-plus'"></i>
          </button>
        </div>
        <div class="flow-row" style="margin-top:10px;flex-wrap:wrap">
          <span :class="coldTypeBadge(product.coldType)">{{ coldTypeLabel(product.coldType) }}</span>
          <span class="badge-temp">{{ product.temperatureRange }}</span>
          <span class="flow-pill">{{ brandForProduct(product) }}</span>
        </div>
        <div class="flow-row-between" style="margin-top:12px">
          <span class="flow-pill flow-pill-green">{{ product.commercialAvailability }}</span>
          <strong>S/ {{ product.price.toFixed(2) }}</strong>
        </div>
        <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:12px" @click="router.push('/portal/product-catalog/' + product.id)">
          {{ t('catalog.viewDetails') }}
        </button>
      </div>
      </article>
    </div>
  </div>
</template>
