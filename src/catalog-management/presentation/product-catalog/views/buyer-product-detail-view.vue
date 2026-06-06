<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/app/application/stores/data.store';
import { useCartStore } from '@/app/application/stores/cart.store';
import { coldTypeLabel, coldTypeBadge } from '@/shared/status';
import { brandForProduct } from '@/catalog-management/application/product-catalog/product-brand';

const route = useRoute();
const router = useRouter();
const ds = useDataStore();
const cart = useCartStore();

const product = computed(() => ds.productById(route.params.id));
const promos = computed(() => product.value ? ds.promotionsForProduct(product.value.id) : []);
const related = computed(() => product.value ? ds.D.products.filter(item => item.category === product.value.category && item.id !== product.value.id).slice(0, 3) : []);
</script>

<template>
  <div v-if="!product" class="empty-state">
    <div class="empty-state-icon"><i class="pi pi-search"></i></div>
    <div class="empty-state-title">Product not found</div>
    <button class="btn btn-primary" @click="router.push('/portal/product-catalog')">Back to Product Catalog</button>
  </div>

  <template v-else>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <button class="btn btn-ghost btn-sm" @click="router.push('/portal/product-catalog')"><i class="pi pi-arrow-left"></i> Product Catalog</button>
      <div>
        <div class="page-title">{{ product.name }}</div>
        <div class="page-subtitle">{{ product.sku }} - {{ product.category }} - Brand: {{ brandForProduct(product) }}</div>
      </div>
    </div>

    <div class="flow-grid-12">
      <section class="buyer-card span-5">
        <div class="buyer-product-visual" :class="'cat-' + product.cat" style="height:300px">
          <i class="pi pi-box" style="font-size:74px"></i>
          <span v-if="promos.length" class="flow-pill flow-pill-amber" style="position:absolute;left:16px;top:16px">Active offer</span>
        </div>
      </section>

      <section class="flow-panel span-7">
        <div class="flow-panel-pad flow-stack">
          <div class="flow-row" style="flex-wrap:wrap">
            <span :class="coldTypeBadge(product.coldType)">{{ coldTypeLabel(product.coldType) }}</span>
            <span class="badge-temp">{{ product.temperatureRange }}</span>
            <span class="flow-pill flow-pill-green">{{ product.commercialAvailability }}</span>
            <span class="flow-pill">{{ brandForProduct(product) }}</span>
          </div>
          <div>
            <div class="buyer-title" style="color:#0F172A">{{ product.name }}</div>
            <div class="flow-note" style="margin-top:8px">{{ product.description }}</div>
          </div>
          <div class="grid-3">
            <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
              <div class="flow-eyebrow">Unit</div>
              <strong>{{ product.unit }}</strong>
            </div>
            <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
              <div class="flow-eyebrow">Weight</div>
              <strong>{{ product.weightKg }} kg</strong>
            </div>
            <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
              <div class="flow-eyebrow">Ref. Price</div>
              <strong>S/ {{ product.price.toFixed(2) }}</strong>
            </div>
            <div class="flow-panel-pad" style="background:#F8FAFC;border-radius:10px">
              <div class="flow-eyebrow">Brand</div>
              <strong>{{ brandForProduct(product) }}</strong>
            </div>
          </div>
          <div v-if="promos.length" class="banner banner-warning">
            <i class="pi pi-tag"></i>
            <div><strong>{{ promos[0].name }}:</strong> {{ promos[0].discountLabel }}. {{ promos[0].notes }}</div>
          </div>
          <div class="banner banner-info">
            <i class="pi pi-sparkles"></i>
            <div>
              <strong>Premium product knowledge:</strong> {{ product.knowledge }}
              <span class="premium-lock" style="margin-left:6px"><i class="pi pi-lock"></i> Preview</span>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" style="justify-content:center" @click="cart.add(product); router.push('/portal/request-builder')">
            <i class="pi pi-plus"></i> Add to Request
          </button>
        </div>
      </section>

      <section class="flow-panel span-12" v-if="related.length">
        <div class="flow-panel-head"><div class="flow-title">Related Products</div></div>
        <div class="grid-3 flow-panel-pad">
          <article v-for="item in related" :key="item.id" class="buyer-card flow-panel-pad">
            <div style="font-weight:800">{{ item.name }}</div>
            <div class="flow-note">{{ brandForProduct(item) }} - {{ item.category }} - {{ item.temperatureRange }}</div>
            <button class="btn btn-ghost btn-sm" style="margin-top:12px" @click="router.push('/portal/product-catalog/' + item.id)">View</button>
          </article>
        </div>
      </section>
    </div>
  </template>
</template>
