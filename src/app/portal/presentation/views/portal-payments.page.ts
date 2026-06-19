import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerPaymentRecord, PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-payments',
    imports: [CommonModule, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.payments' | t }}</h1>
          <p class="portal-page-subtitle">{{ 'portal.sections.payments.subtitle' | t }}</p>
        </div>
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
          <div class="banner banner-info" style="margin-bottom: 22px;">
            <nx-icon name="pi-info-circle"></nx-icon>
            <div>{{ 'portal.payments.infoBanner' | t }}</div>
          </div>

          <div class="grid-3" style="margin-bottom: 22px;">
            <article class="buyer-card flow-panel-pad">
              <div class="flow-row" style="gap: 8px;">
                <nx-icon name="pi-check-circle" style="color: #22C55E;"></nx-icon>
                <span class="flow-eyebrow">{{ 'portal.payments.paid' | t }}</span>
              </div>
              <div class="flow-metric payment-metric-green" style="font-size: 26px; font-weight: 800; margin-top: 10px;">S/ {{ moneyNoComma(paymentTotal(data.payments, 'paid')) }}</div>
              <div class="flow-note" style="margin-top: 4px;">{{ 'portal.payments.paidSub' | t }}</div>
            </article>
            <article class="buyer-card flow-panel-pad">
              <div class="flow-row" style="gap: 8px;">
                <nx-icon name="pi-clock" style="color: #F59E0B;"></nx-icon>
                <span class="flow-eyebrow">{{ 'portal.payments.pending' | t }}</span>
              </div>
              <div class="flow-metric payment-metric-amber" style="font-size: 26px; font-weight: 800; margin-top: 10px;">S/ {{ moneyNoComma(paymentTotal(data.payments, 'pending')) }}</div>
              <div class="flow-note" style="margin-top: 4px;">{{ 'portal.payments.pendingSub' | t }}</div>
            </article>
            <article class="buyer-card flow-panel-pad">
              <div class="flow-row" style="gap: 8px;">
                <nx-icon name="pi-credit-card" style="color: #2563EB;"></nx-icon>
                <span class="flow-eyebrow">{{ 'portal.payments.records' | t }}</span>
              </div>
              <div class="flow-metric payment-metric-blue" style="font-size: 26px; font-weight: 800; margin-top: 10px;">{{ data.payments.length }}</div>
              <div class="flow-note" style="margin-top: 4px;">{{ 'portal.payments.recordsSub' | t }}</div>
            </article>
          </div>

          <div class="flow-stack">
            <section class="flow-panel">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.payments.recordsTitle' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.payments.recordsSubtitle' | t }}</div>
                </div>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>{{ 'portal.payments.reference' | t }}</th>
                      <th>{{ 'portal.payments.invoice' | t }}</th>
                      <th>{{ 'orders.table.order' | t }}</th>
                      <th>{{ 'portal.documents.amount' | t }}</th>
                      <th>{{ 'orders.table.status' | t }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (payment of data.payments; track payment.id) {
                      <tr>
                        <td><strong class="text-mono">{{ payment.referenceCode }}</strong></td>
                        <td>{{ payment.invoiceCode }}</td>
                        <td>{{ payment.orderId || ('common.pending' | t) }}</td>
                        <td><strong>{{ paymentMoney(payment) }}</strong></td>
                        <td><span class="flow-pill" [ngClass]="statusClass(payment.status)">{{ statusLabel(payment.status) }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>

            <section class="flow-panel">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.payments.methodsTitle' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.payments.methodsSubtitle' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad flow-stack">
                @for (method of data.paymentMethods; track method.id) {
                  <div class="flow-list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                    <div>
                      <strong>{{ method.label || method.brand }}</strong>
                      <div class="flow-note">{{ method.brand }} · {{ method.type }} · **** {{ method.last4 }}</div>
                    </div>
                    <button type="button" class="secondary-btn btn-sm" [disabled]="method.isDefault">
                      {{ method.isDefault ? ('portal.payments.default' | t) : ('portal.payments.setDefault' | t) }}
                    </button>
                  </div>
                }
              </div>
            </section>
          </div>
        }
      }
    </div>
  `
})
export class PortalPaymentsPage {
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

  moneyNoComma(value: number): string {
    return Number(value || 0).toFixed(2);
  }

  paymentTotal(payments: BuyerPaymentRecord[], status: 'paid' | 'pending'): number {
    return payments
      .filter((payment) => status === 'paid' ? payment.status === 'paid' : payment.status !== 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  paymentMoney(payment: BuyerPaymentRecord): string {
    return `${payment.currency} ${payment.amount.toFixed(2)}`;
  }

  statusLabel(status: string): string {
    return this.i18n.t(`portal.status.${status}`);
  }

  statusClass(status: string): string {
    if (/available|accepted|active|delivered|confirmed|paid/i.test(status)) return 'flow-pill-green';
    if (/pending|review|validating|preparing/i.test(status)) return 'flow-pill-amber';
    if (/blocked|cancel/i.test(status)) return 'flow-pill-red';
    return 'flow-pill-blue';
  }
}
