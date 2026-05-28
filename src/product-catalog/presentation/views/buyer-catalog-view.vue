<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { coldTypeLabel, coldTypeBadge } from '@/shared/status';

const router = useRouter();
const ds = useDataStore();
const cart = useCartStore();
const D = ds.D;

const search = ref('');
const category = ref('all');
const coldType = ref('all');
const onlyOffers = ref(false);

const categories = computed(() => ['all', ...new Set(D.products.filter(p => p.isVisibleToBuyer).map(p => p.category))]);
const coldTypes = ['all', 'frozen', 'chilled', 'ambient'];

const filtered = computed(() => {
  let rows = D.products.filter(product => product.isVisibleToBuyer && product.status !== 'out');
  if (category.value !== 'all') rows = rows.filter(product => product.category === category.value);
  if (coldType.value !== 'all') rows = rows.filter(product => product.coldType === coldType.value);
  if (onlyOffers.value) rows = rows.filter(product => ds.promotionsForProduct(product.id).length);
  if (search.value) {
    const q = search.value.toLowerCase();
    rows = rows.filter(product =>
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    );
  }
  return rows;
});

const isInCart = (id) => cart.items.some(item => item.productId === id);
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Product Catalog</div>
      <div class="page-subtitle">{{ filtered.length }} authorized products - commercial availability, not exact internal stock.</div>
    </div>
    <button class="btn btn-primary" @click="router.push('/portal/request-builder')">
      <i class="pi pi-shopping-cart"></i> Request Builder ({{ cart.count }})
    </button>
  </div>

  <div class="filter-bar">
    <div class="search-input">
      <i class="pi pi-search"></i>
      <input v-model="search" placeholder="Search product, SKU or category..." />
    </div>
    <button v-for="item in categories" :key="item" class="filter-chip" :class="{ active: category === item }" @click="category = item">
      {{ item === 'all' ? 'All categories' : item }}
    </button>
    <button v-for="item in coldTypes" :key="item" class="filter-chip" :class="{ active: coldType === item }" @click="coldType = item">
      {{ item === 'all' ? 'All cold types' : coldTypeLabel(item) }}
    </button>
    <button class="filter-chip" :class="{ active: onlyOffers }" @click="onlyOffers = !onlyOffers">
      <i class="pi pi-tag"></i> Offers
    </button>
  </div>

  <div class="grid-4">
    <article v-for="product in filtered" :key="product.id" class="buyer-card">
      <div class="buyer-product-visual" :class="'cat-' + product.cat" @click="router.push('/portal/product-catalog/' + product.id)" style="cursor:pointer">
        <i class="pi pi-box"></i>
        <span v-if="ds.promotionsForProduct(product.id).length" class="flow-pill flow-pill-amber" style="position:absolute;left:12px;top:12px">
          Offer
        </span>
      </div>
      <div style="padding:14px">
        <div class="flow-row-between" style="align-items:flex-start;gap:8px">
          <div>
            <div style="font-size:14px;font-weight:800;color:#0F172A;line-height:1.25">{{ product.name }}</div>
            <div class="mono" style="font-size:10px;margin-top:4px">{{ product.sku }}</div>
          </div>
          <button
            :class="'add-btn ' + (isInCart(product.id) ? 'add-btn-added' : 'add-btn-default')"
            @click="cart.add(product)"
            :aria-label="isInCart(product.id) ? 'In request' : 'Add to Request'"
          >
            <i :class="isInCart(product.id) ? 'pi pi-check' : 'pi pi-plus'"></i>
          </button>
        </div>
        <div class="flow-row" style="margin-top:10px;flex-wrap:wrap">
          <span :class="coldTypeBadge(product.coldType)">{{ coldTypeLabel(product.coldType) }}</span>
          <span class="badge-temp">{{ product.temperatureRange }}</span>
        </div>
        <div class="flow-row-between" style="margin-top:12px">
          <span class="flow-pill flow-pill-green">{{ product.commercialAvailability }}</span>
          <strong>S/ {{ product.price.toFixed(2) }}</strong>
        </div>
        <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:12px" @click="router.push('/portal/product-catalog/' + product.id)">
          View Details
        </button>
      </div>
    </article>
  </div>
</template>
