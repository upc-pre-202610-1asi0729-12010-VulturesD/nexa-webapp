import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BuyerRequest, PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-portal-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-page">
      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!request()) {
        <div class="empty-state">
          <div class="empty-state-icon"><nx-icon name="pi-search"></nx-icon></div>
          <div class="empty-state-title">{{ 'portal.detail.requestNotFound' | t }}</div>
          <a routerLink="/portal/purchase-requests" class="primary-btn">{{ 'portal.detail.backRequests' | t }}</a>
        </div>
      } @else {
        @if (request(); as item) {
          <div class="flow-row" style="margin-bottom:4px;flex-wrap:wrap">
            <a routerLink="/portal/purchase-requests" class="btn btn-ghost btn-sm"><i class="pi pi-arrow-left"></i>{{ 'portal.detail.backRequests' | t }}</a>
            <span class="flow-pill" [ngClass]="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
          </div>
          <section class="buyer-shell-band portal-section-hero">
            <div>
              <div class="flow-eyebrow">{{ 'portal.requests.title' | t }}</div>
              <h1 class="buyer-title">{{ item.id }}</h1>
              <p class="buyer-subtitle">{{ item.comments }}</p>
            </div>
            <div class="buyer-hero-panel">
              <span>{{ 'portal.builder.deliveryDate' | t }}</span>
              <strong>{{ item.requestedDeliveryDate }}</strong>
              <span>{{ 'portal.builder.priority' | t }} · {{ item.priority }}</span>
            </div>
          </section>
          <div class="flow-grid-12">
            <section class="flow-panel span-8">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.detail.requestItems' | t }}</div>
                  <div class="flow-subtitle">{{ item.items.length }} {{ 'portal.requests.items' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad flow-stack">
                @for (line of item.items; track line.productId) {
                  <article class="flow-list-item">
                    <div>
                      <strong>{{ line.name }}</strong>
                      <div class="flow-note">{{ line.productId }} · {{ line.qty }} {{ line.unit || ('portal.units.default' | t) }}</div>
                    </div>
                    <strong>S/ {{ (line.price || 0) * line.qty | number:'1.2-2' }}</strong>
                  </article>
                }
              </div>
            </section>
            <aside class="flow-panel span-4">
              <div class="flow-panel-pad flow-stack">
                <div class="flow-eyebrow">{{ 'portal.detail.commercialReview' | t }}</div>
                <div class="flow-metric">S/ {{ total(item) | number:'1.2-2' }}</div>
                <div class="mini-row"><span>{{ 'portal.builder.deliveryAddress' | t }}</span><strong>{{ addressLabel(item.deliveryAddressId) }}</strong></div>
                <div class="mini-row"><span>{{ 'portal.detail.documentProfile' | t }}</span><strong>{{ item.documentProfile || '-' }}</strong></div>
                <p class="flow-note">{{ 'portal.detail.requestReviewCopy' | t }}</p>
                <a routerLink="/portal/request-builder" class="secondary-btn">{{ 'portal.actions.createRequest' | t }}</a>
              </div>
            </aside>
            <section class="flow-panel span-12">
              <div class="flow-panel-head">
                <div class="flow-title">{{ 'portal.detail.conversation' | t }}</div>
              </div>
              <div class="flow-panel-pad flow-stack">
                @for (message of messages(item.id); track message.id) {
                  <article class="flow-list-item">
                    <div>
                      <strong>{{ message.senderName }}</strong>
                      <div class="flow-note">{{ message.body }}</div>
                    </div>
                    <span class="flow-pill flow-pill-blue">{{ message.senderRole }}</span>
                  </article>
                }
                @if (!messages(item.id).length) {
                  <div class="empty-state compact">
                    <div class="empty-state-title">{{ 'portal.detail.noMessages' | t }}</div>
                  </div>
                }
              </div>
            </section>
          </div>
        }
      }
    </div>
  `,
})
export class PortalRequestDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly requestId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });
  readonly request = computed(() => this.snapshot()?.requests.find((item) => item.id === this.requestId()) ?? null);

  constructor() {
    const user = this.session.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }
    this.store.load(user.clientId).subscribe({
      next: (snapshot) => { this.snapshot.set(snapshot); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  total(request: BuyerRequest): number {
    return request.items.reduce((sum, line) => sum + (line.price || 0) * line.qty, 0);
  }

  statusLabel(status: string): string {
    return this.i18n.t(`portal.status.${status}`);
  }

  statusClass(status: string): string {
    if (/available|active|delivered|confirmed|submitted/i.test(status)) return 'flow-pill-green';
    if (/pending|review|validating|preparing/i.test(status)) return 'flow-pill-amber';
    if (/blocked|cancel/i.test(status)) return 'flow-pill-red';
    return 'flow-pill-blue';
  }

  addressLabel(addressId?: string): string {
    const address = this.snapshot()?.deliveryAddresses.find((item) => item.id === addressId);
    return address ? `${address.label} - ${address.window}` : (addressId || '-');
  }

  messages(requestId: string) {
    return this.snapshot()?.messages.filter((message) => message.requestId === requestId) ?? [];
  }
}
