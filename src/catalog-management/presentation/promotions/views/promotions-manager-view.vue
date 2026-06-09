<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/app/application/stores/data.store';

const ds = useDataStore();
const promotions = computed(() => ds.D.promotions);
const activeCount = computed(() => promotions.value.filter(promotion => promotion.status === 'active').length);
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Promotions</div>
        <div class="page-subtitle">Commercial campaign planning for buyer visibility, pricing rules, and catalog activation.</div>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom:18px">
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-megaphone"></i> Campaigns</div>
        <div class="kpi-value">{{ promotions.length }}</div>
        <div class="kpi-sub">Local commercial planning records</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-check-circle" style="color:#16A34A"></i> Active</div>
        <div class="kpi-value" style="color:#16A34A">{{ activeCount }}</div>
        <div class="kpi-sub">Visible to buyer or commercial teams</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-label"><i class="pi pi-box" style="color:#2563EB"></i> Real catalog</div>
        <div class="kpi-value" style="color:#2563EB">{{ ds.D.products.length }}</div>
        <div class="kpi-sub">Products still loaded from backend</div>
      </div>
    </div>

    <div v-if="!promotions.length" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-database"></i></div>
      <div class="empty-state-title">Campaign workspace unavailable</div>
      <div class="empty-state-desc">Start the local support service to review promotion planning records.</div>
    </div>

    <div v-else class="grid-3">
      <article v-for="promotion in promotions" :key="promotion.id" class="flow-panel flow-panel-pad">
        <div class="flow-row-between" style="align-items:flex-start">
          <span :class="'badge ' + (promotion.status === 'active' ? 'badge-green' : promotion.status === 'scheduled' ? 'badge-blue' : 'badge-gray')">
            {{ promotion.status }}
          </span>
          <span class="flow-pill">{{ promotion.visibility }}</span>
        </div>
        <h2 style="margin:12px 0 6px">{{ promotion.name }}</h2>
        <p class="muted-text">{{ promotion.description }}</p>
        <div class="divider" style="margin:12px 0"></div>
        <div class="mini-row">
          <span>Commercial rule</span>
          <strong>{{ promotion.discountLabel }}</strong>
        </div>
        <div class="flow-note" style="margin-top:8px">{{ promotion.notes }}</div>
      </article>
    </div>
  </div>
</template>
