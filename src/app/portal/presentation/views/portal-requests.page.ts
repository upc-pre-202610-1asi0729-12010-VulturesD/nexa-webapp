import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BuyerRequest, PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-requests',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.requests' | t }}</h1>
          <p class="portal-page-subtitle">{{ sectionSubtitleCopy() }}</p>
        </div>
        <a routerLink="/portal/product-catalog" class="primary-btn"><nx-icon name="pi-plus"></nx-icon>{{ 'portal.requests.newRequest' | t }}</a>
      </header>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!user()?.clientId || !snapshot()?.client) {
        <div class="flow-panel">
          <div class="empty-state">
            <div class="empty-state-icon"><nx-icon name="pi-lock"></nx-icon></div>
            <div class="empty-state-title">{{ 'portal.empty.noClientTitle' | t }}</div>
          </div>
        </div>
      } @else {
        @if (snapshot(); as data) {
          <div class="flow-stack">
            @for (request of requestsForDisplay(data); track request.id) {
              <article class="buyer-card flow-panel-pad">
                <div class="flow-row-between buyer-record-head">
                  <div>
                    <div class="flow-row" style="margin-bottom:6px">
                      <strong class="text-mono buyer-current-code">{{ request.id }}</strong>
                      <span class="flow-pill" [ngClass]="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
                    </div>
                    <p class="flow-note">{{ request.comments }}</p>
                  </div>
                  <a [routerLink]="['/portal/purchase-requests', request.id]" class="primary-btn btn-sm">{{ 'portal.requests.details' | t }}</a>
                </div>
                <div class="divider"></div>
                <div class="flow-row buyer-request-meta">
                  <span>{{ 'portal.requests.delivery' | t }}: <strong>{{ request.requestedDeliveryDate }}</strong></span>
                  <span>{{ 'portal.requests.itemsLabel' | t }}: <strong>{{ request.items.length }}</strong></span>
                  <span>{{ 'portal.requests.priority' | t }}: <strong>{{ request.priority }}</strong></span>
                </div>
              </article>
            }
          </div>
        }
      }
    </div>
  `
})
export class PortalRequestsPage {
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);

  constructor() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    this.store.load(user.clientId).subscribe({
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  sectionSubtitleCopy(): string {
    const snapshot = this.snapshot();
    if (snapshot) {
      return this.i18n.t('portal.sections.requests.subtitle', { count: snapshot.requests.length });
    }
    return '';
  }

  requestsForDisplay(snapshot: PortalSnapshot): BuyerRequest[] {
    return [...snapshot.requests].sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
  }

  statusLabel(status: string): string {
    return this.i18n.t(`portal.status.${status}`);
  }

  statusClass(status: string): string {
    if (/available|accepted|active|delivered|confirmed|paid|submitted/i.test(status)) return 'flow-pill-green';
    if (/pending|review|validating|preparing/i.test(status)) return 'flow-pill-amber';
    if (/blocked|cancel/i.test(status)) return 'flow-pill-red';
    return 'flow-pill-blue';
  }
}
