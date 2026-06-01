<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const supportCards = [
  {
    icon: 'pi-inbox',
    title: 'Request review',
    copy: 'For S3 purchase requests, use My Requests to review S1 comments, adjustment requests and conversion status.',
    action: 'Open requests',
    to: '/portal/purchase-requests',
  },
  {
    icon: 'pi-truck',
    title: 'Order tracking',
    copy: 'For confirmed orders, use My Orders to check validation, documents, dispatch preparation and delivery events.',
    action: 'Open orders',
    to: '/portal/purchase-orders',
  },
  {
    icon: 'pi-user-edit',
    title: 'Buyer account',
    copy: 'Update buyer identity, delivery preferences and the payment summary from your S3 profile.',
    action: 'Open profile',
    to: '/portal/profile',
  },
];
</script>

<template>
  <div class="legal-page">
    <section class="legal-hero support-hero">
      <div class="legal-hero-copy">
        <span class="legal-pill">Support</span>
        <h1>Portal Support</h1>
        <p>Operational support for the Nexa S3 Buyer Portal preview, request tracking and simulated account setup.</p>
      </div>
      <aside class="legal-hero-note" aria-label="Support scope">
        <span>Support scope</span>
        <strong>Academic workflow assistance</strong>
        <p>Use this page to navigate the local demo. Real production support channels are not active in this milestone.</p>
      </aside>
    </section>

    <div class="flow-grid-12">
      <article
        v-for="card in supportCards"
        :key="card.title"
        class="flow-panel span-4 support-card"
      >
        <div class="flow-panel-pad flow-stack">
          <div class="support-icon"><i :class="'pi ' + card.icon" aria-hidden="true"></i></div>
          <div>
            <h2>{{ card.title }}</h2>
            <p>{{ card.copy }}</p>
          </div>
          <button class="btn btn-primary" @click="router.push(card.to)">{{ card.action }}</button>
        </div>
      </article>

      <section class="flow-panel span-12">
        <div class="flow-panel-head">
          <div>
            <div class="flow-title">Support Notes</div>
            <div class="flow-subtitle">Local preview behavior for presentation and QA.</div>
          </div>
        </div>
        <div class="flow-panel-pad support-note-grid">
          <div>
            <span class="flow-eyebrow">S3 buyer flow</span>
            <p>Catalog, request builder, business documents and tracking are connected to the Fake API transition contract.</p>
          </div>
          <div>
            <span class="flow-eyebrow">Response expectation</span>
            <p>Support is represented as classroom demo guidance. No ticketing, email queue or service desk backend is connected.</p>
          </div>
          <div>
            <span class="flow-eyebrow">Data reset</span>
            <p>Clear browser storage and reset `server/db.json` if a local demo needs to return to the seeded state.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
