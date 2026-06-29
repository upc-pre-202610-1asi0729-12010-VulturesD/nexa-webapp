import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyerPaymentRecord, PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { environment } from '@env/environment';

@Component({
    selector: 'nx-portal-payments',
    imports: [CommonModule, FormsModule, TranslatePipe, NexaIconComponent],
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

          <section class="flow-panel payment-credit-panel">
            <div class="flow-panel-pad payment-credit-grid">
              <div>
                <div class="flow-eyebrow">{{ 'portal.payments.monthlyCredit' | t }}</div>
                <div class="payment-credit-value">S/ {{ creditLimit().toLocaleString() }}</div>
                <div class="flow-note">{{ 'portal.payments.availableCredit' | t:{ available: availableCredit().toLocaleString(), limit: creditLimit().toLocaleString() } }}</div>
                <div class="payment-meter" [attr.aria-label]="'portal.payments.creditUsage' | t"><span [style.width.%]="creditUsagePercent()"></span></div>
              </div>
              <div class="payment-next-card">
                <div class="flow-eyebrow">{{ 'portal.payments.nextPayment' | t }}</div>
                <strong>{{ nextDue() ? paymentMoney(nextDue()!) : ('portal.payments.noPendingPayment' | t) }}</strong>
                <span>{{ nextDue()?.referenceCode || ('portal.payments.creditLineClear' | t) }}</span>
              </div>
              <label class="payment-next-card">
                <span class="flow-eyebrow">{{ 'portal.payments.paymentOption' | t }}</span>
                <select [(ngModel)]="selectedPaymentOption" [attr.aria-label]="'portal.payments.paymentOption' | t">
                  <option value="">{{ 'portal.payments.referencePaymentOption' | t }}</option>
                  @for (option of data.paymentOptions; track option.id) { <option [value]="option.code">{{ option.label }}</option> }
                </select>
                <span>{{ 'portal.payments.paymentOptionHelp' | t }}</span>
              </label>
            </div>
          </section>

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

          <section class="flow-panel stripe-panel">
            <div class="flow-panel-head"><div><div class="flow-title">{{ 'stripePayments.title' | t }}</div><div class="flow-subtitle">{{ 'stripePayments.subtitle' | t }}</div></div><span [class]="'badge ' + (stripeConfigured ? 'badge-green' : 'badge-amber')">{{ (stripeConfigured ? 'stripePayments.keyReady' : 'stripePayments.keyMissing') | t }}</span></div>
            <div class="flow-panel-pad stripe-grid"><div><span class="flow-eyebrow">{{ 'stripePayments.selected' | t }}</span><strong>{{ nextDue()?.referenceCode || ('stripePayments.noPendingSelected' | t) }}</strong><small>{{ nextDue() ? paymentMoney(nextDue()!) : ('stripePayments.recordRequired' | t) }}</small></div><div><strong>{{ 'stripePayments.realStates' | t }}</strong><span>{{ 'stripePayments.realStatesDesc' | t }}</span></div><button type="button" class="btn btn-primary" [disabled]="!stripeConfigured || !nextDue() || stripePreparing()" (click)="prepareStripe()"><nx-icon name="pi-credit-card"></nx-icon>{{ (stripePreparing() ? 'stripePayments.preparing' : 'stripePayments.prepare') | t }}</button></div>
            @if (stripeError()) { <div class="banner banner-warning" role="status">{{ stripeError() }}</div> }
          </section>

          <section class="payment-insights-grid" [attr.aria-label]="'portal.payments.insights' | t">
            <article class="flow-panel payment-chart-panel">
              <div class="flow-panel-head"><div><div class="flow-title">{{ 'portal.payments.balanceTitle' | t }}</div><div class="flow-subtitle">{{ 'portal.payments.balanceSubtitle' | t }}</div></div></div>
              <div class="flow-panel-pad payment-bars">
                @for (row of paymentChart(); track row.key) {
                  <div class="payment-bar-row"><div class="flow-row-between"><strong>{{ row.label }}</strong><span>{{ formatMoney(row.value) }}</span></div><div class="payment-bar-track"><span [style.width.%]="row.percent" [style.background]="row.color"></span></div></div>
                }
              </div>
            </article>
            <article class="flow-panel payment-chart-panel">
              <div class="flow-panel-head"><div><div class="flow-title">{{ 'portal.payments.recentActivity' | t }}</div><div class="flow-subtitle">{{ 'portal.payments.recentActivitySubtitle' | t }}</div></div></div>
              <div class="flow-panel-pad payment-bars">
                @for (row of recentPaymentChart(); track row.id) {
                  <div class="payment-bar-row compact"><div class="flow-row-between"><span class="text-mono">{{ row.label }}</span><strong>{{ formatMoney(row.value) }}</strong></div><div class="payment-bar-track"><span [style.width.%]="row.percent"></span></div></div>
                } @empty { <div class="flow-note">{{ 'portal.payments.noPaymentActivity' | t }}</div> }
              </div>
            </article>
          </section>

          <div class="flow-stack">
            <section class="flow-panel">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'portal.payments.recordsTitle' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.payments.recordsSubtitle' | t }}</div>
                </div>
                <div class="flow-row">@for (status of paymentStatuses; track status) { <button type="button" class="btn btn-sm" [class.btn-primary]="statusFilter() === status" [class.btn-ghost]="statusFilter() !== status" (click)="statusFilter.set(status)">{{ ('portal.payments.status.' + status) | t }}</button> }</div>
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
                    @for (payment of filteredPayments(); track payment.id) {
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
                <button type="button" class="btn btn-primary btn-sm" (click)="showAddMethod.set(!showAddMethod())"><nx-icon [name]="showAddMethod() ? 'pi-times' : 'pi-plus'"></nx-icon>{{ (showAddMethod() ? 'common.cancel' : 'portal.payments.addPaymentMethod') | t }}</button>
              </div>
              <div class="flow-panel-pad flow-stack">
                @if (paymentMethodError()) { <div class="banner banner-danger" role="alert">{{ paymentMethodError() }}</div> }
                @if (showAddMethod()) { <form class="payment-method-form" (ngSubmit)="addMethod()"><label><span>{{ 'portal.payments.form.methodType' | t }}</span><select [(ngModel)]="methodType" name="methodType"><option value="card">{{ 'portal.payments.form.card' | t }}</option><option value="bank_transfer">{{ 'portal.payments.form.bankTransfer' | t }}</option><option value="cash">{{ 'portal.payments.form.cashAgreement' | t }}</option></select></label>@if (methodType === 'card') { <label><span>{{ 'portal.payments.form.cardBrand' | t }}</span><select [(ngModel)]="cardBrand" name="cardBrand"><option>Visa</option><option>Mastercard</option><option>American Express</option></select></label><label><span>{{ 'portal.payments.form.lastFour' | t }}</span><input [(ngModel)]="lastFour" name="lastFour" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="1234"><small>{{ 'portal.payments.form.maskedCardHelp' | t }}</small></label> } @else { <label><span>{{ 'portal.payments.form.referenceLabel' | t }}</span><input [(ngModel)]="methodLabel" name="methodLabel" maxlength="80" [placeholder]="'portal.payments.form.referencePlaceholder' | t"></label> }<label class="default-check"><input type="checkbox" [(ngModel)]="makeDefault" name="makeDefault"><span>{{ 'portal.payments.form.useDefault' | t }}</span></label><button type="submit" class="btn btn-primary" [disabled]="savingMethod() !== '' || !canAddMethod()">{{ 'portal.payments.form.saveMethod' | t }}</button></form> }
                @for (method of data.paymentMethods; track method.id) {
                  <div class="flow-list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
                    <div>
                      <strong>{{ method.label || method.brand }}</strong>
                      <div class="flow-note">{{ method.brand }} · {{ method.type }} · **** {{ method.last4 }}</div>
                    </div>
                    <button type="button" class="secondary-btn btn-sm" [disabled]="method.isDefault || savingMethod() === method.id" (click)="setDefault(method.id)">
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
  `,
  styles: [`
    .payment-credit-panel,.stripe-panel,.payment-insights-grid{margin-bottom:22px}.payment-credit-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(220px,.8fr) minmax(240px,.8fr);gap:16px;align-items:stretch}.payment-credit-value{color:#0f172a;font-size:36px;font-weight:900;line-height:1;margin:8px 0}.payment-meter{height:12px;margin-top:16px;overflow:hidden;border-radius:999px;background:#e2e8f0}.payment-meter span{display:block;height:100%;border-radius:inherit;background:#2563eb}.payment-next-card{display:grid;align-content:center;gap:8px;padding:16px;border:1px solid #dbe3ef;border-radius:8px;background:#f8fafc}.payment-next-card strong{font-size:20px;color:#0f172a}.payment-next-card span{color:#64748b;font-size:12px}.payment-next-card select{min-height:40px;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a}
    .stripe-grid{display:grid;grid-template-columns:1fr 1.4fr auto;gap:16px;align-items:center}.stripe-grid>div{display:grid;gap:5px}.stripe-grid strong{color:#0f172a}.stripe-grid span,.stripe-grid small{color:#64748b;font-size:11px}.payment-insights-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.payment-bars{display:grid;gap:16px}.payment-bar-row{display:grid;gap:8px}.payment-bar-row.compact{gap:5px}.payment-bar-track{height:10px;overflow:hidden;border-radius:999px;background:#e2e8f0}.payment-bar-track span{display:block;height:100%;min-width:0;border-radius:inherit;background:#2563eb}.flow-row-between{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#475569;font-size:12px}
    .payment-method-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto auto;gap:12px;align-items:end;padding:14px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff}
    .payment-method-form label{display:grid;gap:5px;color:#475569;font-size:11px;font-weight:700}.payment-method-form select,.payment-method-form input{min-height:40px;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a}.payment-method-form small{font-weight:400;color:#64748b}.payment-method-form .default-check{display:flex;align-items:center;gap:7px;min-height:40px}.default-check input{min-height:auto}@media(max-width:900px){.payment-credit-grid,.stripe-grid,.payment-insights-grid,.payment-method-form{grid-template-columns:1fr}}
  `]
})
export class PortalPaymentsPage {
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly savingMethod = signal('');
  readonly paymentMethodError = signal('');
  readonly showAddMethod = signal(false);
  readonly statusFilter = signal('all');
  readonly paymentStatuses = ['all', 'pending', 'processing', 'paid', 'failed', 'cancelled'];
  readonly stripeConfigured = Boolean(environment.stripePublishableKey);
  readonly stripePreparing = signal(false);
  readonly stripeError = signal('');
  readonly filteredPayments = computed(() => {
    const payments = this.snapshot()?.payments ?? [];
    return this.statusFilter() === 'all' ? payments : payments.filter((payment) => this.paymentState(payment.status) === this.statusFilter());
  });
  readonly nextDue = computed(() => this.snapshot()?.payments.find((payment) => ['pending', 'processing'].includes(this.paymentState(payment.status))) ?? null);
  readonly creditLimit = computed(() => this.snapshot()?.dashboardSummary?.creditSummary?.creditLimit ?? 0);
  readonly availableCredit = computed(() => this.snapshot()?.dashboardSummary?.creditSummary?.availableCredit ?? 0);
  readonly creditUsagePercent = computed(() => {
    const limit = this.creditLimit();
    const used = this.snapshot()?.dashboardSummary?.creditSummary?.usedCredit ?? 0;
    return limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  });
  readonly paymentChart = computed(() => this.withBarPercent([
    { key: 'paid', label: this.i18n.t('portal.payments.status.paid'), value: this.paymentTotal(this.snapshot()?.payments ?? [], 'paid'), color: '#16a34a' },
    { key: 'pending', label: this.i18n.t('portal.payments.status.pending'), value: this.paymentTotal(this.snapshot()?.payments ?? [], 'pending'), color: '#f59e0b' },
  ]));
  readonly recentPaymentChart = computed(() => this.withBarPercent((this.snapshot()?.payments ?? []).slice(0, 6).map((payment) => ({
    id: payment.id,
    key: payment.id,
    label: payment.referenceCode || payment.id,
    value: payment.amount,
    color: '#2563eb',
  }))));
  methodType = 'card';
  methodLabel = '';
  cardBrand = 'Visa';
  lastFour = '';
  selectedPaymentOption = '';
  makeDefault = true;

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
      .filter((payment) => status === 'paid' ? this.paymentState(payment.status) === 'paid' : ['pending', 'processing'].includes(this.paymentState(payment.status)))
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  paymentMoney(payment: BuyerPaymentRecord): string {
    return `${payment.currency} ${payment.amount.toFixed(2)}`;
  }

  formatMoney(value: number, currency = 'PEN'): string {
    return `${currency} ${Number(value || 0).toFixed(2)}`;
  }

  canAddMethod(): boolean {
    return this.methodType === 'card' ? /^\d{4}$/.test(this.lastFour) : Boolean(this.methodLabel.trim());
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

  paymentState(status: string): string {
    const value = status.toLowerCase();
    if (['paid', 'confirmed'].includes(value)) return 'paid';
    if (['failed', 'rejected'].includes(value)) return 'failed';
    if (value === 'cancelled') return 'cancelled';
    if (value === 'processing') return 'processing';
    return 'pending';
  }

  setDefault(id: string): void {
    this.savingMethod.set(id);
    this.paymentMethodError.set('');
    this.store.setDefaultPaymentMethod(id).subscribe({
      next: () => {
        const clientId = this.user()?.clientId;
        if (!clientId) { this.savingMethod.set(''); return; }
        this.store.load(clientId).subscribe({
          next: (snapshot) => { this.snapshot.set(snapshot); this.savingMethod.set(''); },
          error: () => this.savingMethod.set(''),
        });
      },
      error: () => { this.savingMethod.set(''); this.paymentMethodError.set(this.i18n.t('portal.payments.errors.defaultUpdate')); },
    });
  }

  addMethod(): void {
    const clientId = this.user()?.clientId;
    if (!clientId || !this.canAddMethod()) return;
    this.savingMethod.set('new');
    this.paymentMethodError.set('');
    const label = this.methodType === 'card' ? `${this.cardBrand} **** ${this.lastFour}` : this.methodLabel.trim();
    this.store.addPaymentMethod(clientId, this.methodType, label, this.makeDefault).subscribe({
      next: () => {
        this.methodLabel = '';
        this.cardBrand = 'Visa';
        this.lastFour = '';
        this.makeDefault = false;
        this.showAddMethod.set(false);
        this.store.load(clientId).subscribe({
          next: (snapshot) => { this.snapshot.set(snapshot); this.savingMethod.set(''); },
          error: () => this.savingMethod.set(''),
        });
      },
      error: () => { this.savingMethod.set(''); this.paymentMethodError.set(this.i18n.t('portal.payments.errors.addMethod')); },
    });
  }

  prepareStripe(): void {
    const payment = this.nextDue();
    if (!payment || !this.stripeConfigured) return;
    this.stripePreparing.set(true);
    this.stripeError.set('');
    this.store.prepareStripeCheckout(payment).subscribe({
      next: (response) => {
        this.stripePreparing.set(false);
        if (response.checkoutUrl) window.location.assign(response.checkoutUrl);
        else this.stripeError.set(response.message);
      },
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.stripePreparing.set(false);
        this.stripeError.set(error.error?.message || error.message || this.i18n.t('stripePayments.prepareError'));
      },
    });
  }

  private withBarPercent<T extends { value: number }>(rows: T[]): Array<T & { percent: number }> {
    const max = Math.max(...rows.map((row) => row.value), 1);
    return rows.map((row) => ({ ...row, percent: Math.max(row.value ? 8 : 0, Math.round((row.value / max) * 100)) }));
  }
}
