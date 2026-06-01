<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  page: {
    type: String,
    default: 'terms',
  },
});

const router = useRouter();

const documents = {
  terms: {
    eyebrow: 'Legal',
    badge: 'Legal document',
    title: 'Terms & Conditions',
    summary: 'These terms describe the academic demo scope of Nexa and the limits of the current frontend prototype.',
    noteTitle: 'Prototype scope',
    noteHeadline: 'Frontend academic demo + Fake API',
    noteCopy: 'Nexa v1 is a simulated S3 Buyer Portal connected to local WebApp workflows. It is not a production operations service.',
    updated: 'June 2026',
    sections: [
      ['Academic prototype scope', 'Nexa is an academic B2B SaaS frontend prototype created to demonstrate cold-chain workflows for importer-distributors. The current version is not a commercial production deployment.'],
      ['Portal use', 'Access is granted for UX review, role simulation and classroom presentation. Users should not store real purchase commitments, real client credentials or production logistics instructions.'],
      ['Simulated data', 'Client names, product availability, purchase requests, orders, documents, routes, temperature records and messages are simulated records from the Fake API contract.'],
      ['Fake API limitations', 'The local JSON Server API is a temporary simulation layer. It helps validate frontend behavior and endpoint shape before the ASP.NET Core and database backend replace it.'],
      ['No final purchase', 'Requests submitted from S3 are not final purchase orders. S1 commercial validation must approve or convert the request before an order is considered confirmed in this demo.'],
      ['No production payments or billing backend', 'Payment cards, wallets, bank transfer options and B2B credit lines shown in the portal are preview records. Nexa does not process real payments in this version.'],
      ['No official document generation', 'Invoices, guides, CDR references, POD evidence and external portal uploads are UI previews only. They do not replace official SUNAT, logistics or accounting records.'],
      ['No real GPS, IoT or AI services', 'Map tracking, temperature telemetry and assistant responses are simulated or preview-only until production integrations are implemented.'],
      ['External customer portal limitations', 'Customer portal requirements are represented as operational checklists. This WebApp does not connect to external retailer portals in the current milestone.'],
    ],
  },
  privacy: {
    eyebrow: 'Privacy',
    badge: 'Privacy document',
    title: 'Privacy Policy',
    summary: 'This policy explains how the S3 portal represents simulated data while keeping the project honest about its local backend.',
    noteTitle: 'Data scope',
    noteHeadline: 'Local preview data only',
    noteCopy: 'The current WebApp stores classroom demo records and local session preferences. It should not receive real personal or financial information.',
    updated: 'June 2026',
    sections: [
      ['What Nexa is', 'Nexa is an academic cold-chain B2B frontend prototype. It demonstrates role-based workflows for S3 buyers, S1 commercial validation and S2 operations control.'],
      ['Demo data', 'The portal displays seeded clients, buyer users, product catalog rows, delivery addresses, requests, orders, documents and dispatch events for presentation and QA.'],
      ['Local session data', 'Authentication state, selected language, buyer profile preferences and request-builder state may use browser storage during the local preview. Clear browser storage to reset the session.'],
      ['Fake API data', 'Runtime mutations are sent to the local Fake API when it is running. These writes are for simulation and do not create real business obligations.'],
      ['Payment previews', 'Card, wallet, transfer and credit-line records are placeholders for product experience. Do not enter real payment credentials or personal financial information.'],
      ['External integrations', 'SUNAT, customer portals, GPS, IoT sensors, live AI and real document generation are not active in this frontend version.'],
      ['Data deletion', 'Because the portal is a local preview, reset browser storage and the Fake API database seed to remove simulated records created during testing.'],
    ],
  },
};

const current = computed(() => documents[props.page] || documents.terms);
const sideLinks = [
  { label: 'Terms of use', to: '/portal/legal/terms', key: 'terms' },
  { label: 'Privacy policy', to: '/portal/legal/privacy', key: 'privacy' },
  { label: 'Support', to: '/portal/support', key: 'support' },
];
</script>

<template>
  <div class="legal-page">
    <section class="legal-hero">
      <div class="legal-hero-copy">
        <span class="legal-pill">{{ current.eyebrow }}</span>
        <h1>{{ current.title }}</h1>
        <p>{{ current.summary }}</p>
      </div>
      <aside class="legal-hero-note" aria-label="Legal summary">
        <span>{{ current.noteTitle }}</span>
        <strong>{{ current.noteHeadline }}</strong>
        <p>{{ current.noteCopy }}</p>
      </aside>
    </section>

    <div class="legal-layout">
      <nav class="legal-sidebar" aria-label="Portal legal navigation">
        <button
          v-for="link in sideLinks"
          :key="link.to"
          type="button"
          :class="{ active: link.key === page }"
          @click="router.push(link.to)"
        >
          {{ link.label }}
        </button>
      </nav>

      <main class="legal-content">
        <div class="legal-content-head">
          <span class="demo-label">{{ current.badge }}</span>
          <span class="flow-note">Last updated: {{ current.updated }}</span>
        </div>
        <article
          v-for="([title, copy], index) in current.sections"
          :key="title"
          class="legal-section-card"
        >
          <span class="legal-section-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h2>{{ title }}</h2>
            <p>{{ copy }}</p>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>
