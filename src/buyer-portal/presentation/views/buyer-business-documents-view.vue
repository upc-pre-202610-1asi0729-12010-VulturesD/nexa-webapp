<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/iam.store';
import { useDataStore } from '@/app/application/stores/data.store';
import { documentStatusLabel, documentStatusBadge } from '@/shared/status';

const router = useRouter();
const auth = useAuthStore();
const ds = useDataStore();

const docs = computed(() =>
  ds.D.businessDocuments
    .filter(doc => doc.clientId === auth.user?.clientId && (doc.visibleToBuyer || doc.required))
    .sort((a, b) => a.orderId.localeCompare(b.orderId))
);
const visibleDocs = computed(() => docs.value.filter(doc => doc.visibleToBuyer));
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Business Documents</div>
      <div class="page-subtitle">{{ visibleDocs.length }} downloadable documents. Pending states mean S1 is still working on the checklist.</div>
    </div>
    <span class="demo-label">Simulated download</span>
  </div>

  <section class="flow-panel">
    <table class="data-table">
      <thead><tr><th>Purchase Order</th><th>Document</th><th>Status</th><th>Visible</th><th>Action</th></tr></thead>
      <tbody>
        <tr v-for="doc in docs" :key="doc.id">
          <td><span class="mono">{{ doc.orderId }}</span></td>
          <td>
            <div style="font-weight:800">{{ doc.label }}</div>
            <div class="flow-note">{{ doc.fileName }}</div>
          </td>
          <td><span :class="'badge ' + documentStatusBadge(doc.status)">{{ documentStatusLabel(doc.status) }}</span></td>
          <td>{{ doc.visibleToBuyer ? 'Yes' : 'Pending' }}</td>
          <td>
            <div class="flow-row">
              <button class="btn btn-secondary btn-sm" :disabled="!doc.visibleToBuyer">Download</button>
              <button class="btn btn-ghost btn-sm" @click="router.push('/portal/purchase-orders/' + doc.orderId)">Tracking</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
