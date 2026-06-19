import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-order-success',
    imports: [RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <section class="buyer-shell-band portal-section-hero">
        <div>
          <div class="flow-eyebrow">{{ 'portal.eyebrow' | t }}</div>
          <h1 class="buyer-title">{{ 'portal.success.title' | t }}</h1>
          <p class="buyer-subtitle">{{ 'portal.success.subtitle' | t }}</p>
          <div class="buyer-hero-actions">
            <a routerLink="/portal/purchase-requests" class="primary-btn">{{ 'portal.detail.backRequests' | t }}</a>
            <a routerLink="/portal/product-catalog" class="secondary-btn secondary-btn-light">{{ 'portal.actions.viewCatalog' | t }}</a>
          </div>
        </div>
        <div class="buyer-hero-panel">
          <span>{{ 'portal.success.nextStep' | t }}</span>
          <strong>{{ 'portal.success.review' | t }}</strong>
          <span>{{ 'portal.success.copy' | t }}</span>
        </div>
      </section>

      <div class="flow-grid-12">
        <article class="flow-panel span-4">
          <div class="flow-panel-pad flow-stack">
            <div class="support-icon"><nx-icon name="pi-file-edit"></nx-icon></div>
            <h2 class="buyer-card-title">{{ 'portal.success.stepRequest' | t }}</h2>
            <p class="flow-note">{{ 'portal.success.stepRequestCopy' | t }}</p>
          </div>
        </article>
        <article class="flow-panel span-4">
          <div class="flow-panel-pad flow-stack">
            <div class="support-icon"><nx-icon name="pi-check-circle"></nx-icon></div>
            <h2 class="buyer-card-title">{{ 'portal.success.stepValidation' | t }}</h2>
            <p class="flow-note">{{ 'portal.success.stepValidationCopy' | t }}</p>
          </div>
        </article>
        <article class="flow-panel span-4">
          <div class="flow-panel-pad flow-stack">
            <div class="support-icon"><nx-icon name="pi-truck"></nx-icon></div>
            <h2 class="buyer-card-title">{{ 'portal.success.stepDispatch' | t }}</h2>
            <p class="flow-note">{{ 'portal.success.stepDispatchCopy' | t }}</p>
          </div>
        </article>
      </div>
    </div>
  `
})
export class PortalOrderSuccessPage {}
