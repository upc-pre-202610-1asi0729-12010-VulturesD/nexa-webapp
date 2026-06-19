import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Client } from '@app/clients/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Order } from '@app/ordering/domain/model';
import { BuyerPromotion, BuyerRequest, PortalSnapshot } from '@app/portal/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { PortalStore } from '@app/portal/application/portal.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-portal',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-page">
      <section class="buyer-shell-band">
        <div>
          <div class="flow-pill flow-pill-blue buyer-home-eyebrow">{{ 'portal.homePanel.eyebrow' | t }}</div>
          <h1 class="buyer-title">{{ homePanelTitle() }}</h1>
          <p class="buyer-subtitle">{{ homePanelSubtitle() }}</p>
          <div class="buyer-hero-actions">
            <a routerLink="/portal/product-catalog" class="primary-btn buyer-home-catalog-btn">
              <nx-icon name="pi-box"></nx-icon>
              <span>{{ 'portal.nav.catalog' | t }}</span>
            </a>
            <a routerLink="/portal/request-builder" class="secondary-btn secondary-btn-light">
              <nx-icon name="pi-shopping-cart"></nx-icon>
              <span>{{ 'portal.nav.requestBuilder' | t }}</span>
            </a>
          </div>
        </div>
      </section>

      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!user()?.clientId || !snapshot()?.client) {
        <div class="flow-panel">
          <div class="empty-state">
            <div class="empty-state-icon"><nx-icon name="pi-lock"></nx-icon></div>
            <div class="empty-state-title">{{ 'portal.empty.noClientTitle' | t }}</div>
            <div class="empty-state-desc">{{ 'portal.empty.noClientDesc' | t }}</div>
          </div>
        </div>
      } @else {
        <section class="buyer-kpi-grid buyer-home-actions">
          <a routerLink="/portal/product-catalog" class="buyer-card flow-panel-pad buyer-home-card">
            <div class="flow-kpi-icon"><nx-icon name="pi-box"></nx-icon></div>
            <div class="flow-title">{{ 'portal.nav.catalog' | t }}</div>
            <div class="flow-note">{{ 'portal.homePanel.catalogDesc' | t }}</div>
          </a>
          <a routerLink="/portal/purchase-requests" class="buyer-card flow-panel-pad buyer-home-card">
            <div class="flow-kpi-icon" style="background:#FEF3C7;color:#B45309"><nx-icon name="pi-inbox"></nx-icon></div>
            <div class="flow-title">{{ 'portal.nav.requests' | t }}</div>
            <div class="flow-note">{{ requestsDesc() }}</div>
          </a>
          <a routerLink="/portal/purchase-orders" class="buyer-card flow-panel-pad buyer-home-card">
            <div class="flow-kpi-icon" style="background:#ECFEFF;color:#0891B2"><nx-icon name="pi-truck"></nx-icon></div>
            <div class="flow-title">{{ 'portal.nav.orders' | t }}</div>
            <div class="flow-note">{{ ordersDesc() }}</div>
          </a>
          <a routerLink="/portal/business-documents" class="buyer-card flow-panel-pad buyer-home-card">
            <div class="flow-kpi-icon" style="background:#F0FDF4;color:#15803D"><nx-icon name="pi-file-check"></nx-icon></div>
            <div class="flow-title">{{ 'portal.nav.documents' | t }}</div>
            <div class="flow-note">{{ 'portal.homePanel.documentsDesc' | t }}</div>
          </a>
          <a routerLink="/portal/profile" class="buyer-card flow-panel-pad buyer-home-card">
            <div class="flow-kpi-icon" style="background:#EEF2FF;color:#4F46E5"><nx-icon name="pi-credit-card"></nx-icon></div>
            <div class="flow-title">{{ 'portal.homePanel.credit' | t }}</div>
            <div class="flow-note">{{ creditDesc() }}</div>
          </a>
        </section>

        <div class="flow-grid-12">
          <section class="flow-panel span-12">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">{{ 'portal.homePanel.currentStatus' | t }}</div>
                <div class="flow-subtitle">{{ 'portal.homePanel.currentStatusDesc' | t }}</div>
              </div>
              @if (activeOrder()) {
                <span class="flow-pill" [ngClass]="statusClass(activeOrder()!.status)">{{ statusLabel(activeOrder()!.status) }}</span>
              } @else if (activeRequest()) {
                <span class="flow-pill" [ngClass]="statusClass(activeRequest()!.status)">{{ statusLabel(activeRequest()!.status) }}</span>
              }
            </div>
            <div class="flow-panel-pad">
              @if (activeOrder()) {
                <div class="flow-row-between buyer-current-order">
                  <div>
                    <div class="text-mono buyer-current-code">{{ activeOrder()!.id }}</div>
                    <div class="flow-note">{{ requestedDeliveryCopy(activeOrder()!) }}</div>
                  </div>
                  <a [routerLink]="['/portal/purchase-orders', activeOrder()!.id]" class="primary-btn">{{ 'portal.homePanel.openTracking' | t }}</a>
                </div>
                <div class="flow-timeline-horizontal">
                  @for (step of trackingSteps(); track step.key) {
                    <div class="flow-track-step" [ngClass]="step.state">
                      <div class="flow-track-index">{{ step.index }}</div>
                      <div class="flow-track-label">{{ step.label }}</div>
                      <div class="flow-track-date">{{ step.dateLabel }}</div>
                    </div>
                  }
                </div>
              } @else if (activeRequest()) {
                <div class="banner banner-info" style="margin-bottom:0">
                  <i class="pi pi-info-circle"></i>
                  <div>{{ requestStatusCopy(activeRequest()!) }}</div>
                </div>
              } @else {
                <div class="empty-state compact">
                  <div class="empty-state-title">{{ 'portal.homePanel.noActiveRequest' | t }}</div>
                  <a routerLink="/portal/product-catalog" class="primary-btn">{{ 'portal.homePanel.exploreCatalog' | t }}</a>
                </div>
              }
            </div>
          </section>

          <section class="flow-panel span-5">
            <div class="flow-panel-head">
              <div class="flow-title">{{ 'portal.homePanel.activeOffers' | t }}</div>
              <span class="premium-lock"><nx-icon name="pi-lock"></nx-icon>Premium</span>
            </div>
            <div class="flow-panel-pad flow-stack">
              @for (promotion of activePromos(); track promotion.id) {
                <article class="flow-list-item">
                  <div>
                    <div style="font-weight:800">{{ promotionTitle(promotion) }}</div>
                    <div class="flow-note">{{ promotionSummary(promotion) }}</div>
                  </div>
                  <a routerLink="/portal/product-catalog" class="btn btn-ghost btn-sm">{{ 'common.view' | t }}</a>
                </article>
              }
              <a routerLink="/portal/premium" class="btn btn-ghost buyer-premium-preview-link">
                <nx-icon name="pi-sparkles"></nx-icon>
                <span>{{ 'portal.homePanel.viewPremium' | t }}</span>
              </a>
            </div>
          </section>

          <aside class="flow-panel span-7">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">{{ 'portal.homePanel.nextActions' | t }}</div>
                <div class="flow-subtitle">{{ 'portal.homePanel.nextActionsDesc' | t }}</div>
              </div>
            </div>
            <div class="flow-panel-pad quick-action-grid">
              <a routerLink="/portal/purchase-requests" class="secondary-btn">
                <nx-icon name="pi-comments"></nx-icon>
                <span>{{ 'portal.homePanel.nextRequests' | t }}</span>
              </a>
              <a routerLink="/portal/business-documents" class="secondary-btn">
                <nx-icon name="pi-file-check"></nx-icon>
                <span>{{ 'portal.homePanel.nextDocuments' | t }}</span>
              </a>
              <a routerLink="/portal/payment-methods" class="secondary-btn">
                <nx-icon name="pi-credit-card"></nx-icon>
                <span>{{ 'portal.homePanel.nextPayments' | t }}</span>
              </a>
            </div>
          </aside>

          <section class="flow-panel span-12">
            <div class="flow-panel-head">
              <div>
                <div class="flow-title">{{ 'portal.homePanel.suggestedProducts' | t }}</div>
                <div class="flow-subtitle">{{ 'portal.homePanel.suggestedDesc' | t }}</div>
              </div>
            </div>
            <div class="grid-4 flow-panel-pad">
              @for (product of catalogPreview(); track product.id) {
                <article class="buyer-card">
                  <div [class]="'buyer-product-visual cat-' + (product.cat || 'default')">
                    @if (product.imageUrl) {
                      <img class="buyer-product-image" [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
                    } @else {
                      <nx-icon name="pi-box"></nx-icon>
                    }
                  </div>
                  <div style="padding:14px">
                    <div style="font-weight:800;font-size:13px">{{ product.name }}</div>
                    <div class="flow-note">{{ product.category }} - {{ product.temperatureRange || product.temp }}</div>
                    <div class="flow-row-between" style="margin-top:12px">
                      <strong>S/ {{ product.price | number:'1.2-2' }}</strong>
                      <a routerLink="/portal/product-catalog" class="add-btn add-btn-default"><i class="pi pi-plus"></i></a>
                    </div>
                  </div>
                </article>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
})
export class PortalPage {
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);

  client(): Client | null {
    return this.snapshot()?.client ?? null;
  }

  products(): Product[] {
    return this.snapshot()?.products ?? [];
  }

  orders(): Order[] {
    return this.snapshot()?.myOrders ?? [];
  }

  requests(): BuyerRequest[] {
    return this.snapshot()?.requests ?? [];
  }

  activeOrders(): number {
    return this.orders().filter((order) => !/delivered|completed|cancel/i.test(order.status)).length;
  }

  activeOrder(): Order | null {
    return this.recentOrders().find((order) => !/delivered|completed|cancel|rejected/i.test(order.status)) ?? this.recentOrders()[0] ?? null;
  }

  activeRequest(): BuyerRequest | null {
    return this.recentRequests().find((request) => !/converted|rejected/i.test(request.status)) ?? this.recentRequests()[0] ?? null;
  }

  creditAvailable(): number {
    const client = this.client();
    return Math.max(0, Number(client?.creditLimit || 0) - Number(client?.creditUsed || 0));
  }

  homePanelTitle(): string {
    return this.i18n.t('portal.homePanel.title', { name: this.user()?.name?.split(' ')[0] || 'buyer' });
  }

  homePanelSubtitle(): string {
    return this.i18n.t('portal.homePanel.subtitle', {
      company: this.client()?.commercialName || this.client()?.name || this.user()?.clientId || 'Nexa',
    });
  }

  requestsDesc(): string {
    return this.i18n.t('portal.homePanel.requestsDesc', { count: this.requests().length });
  }

  ordersDesc(): string {
    return this.i18n.t('portal.homePanel.ordersDesc', { count: this.orders().length });
  }

  creditDesc(): string {
    return this.i18n.t('portal.homePanel.creditDesc', {
      available: this.formatMoney(this.creditAvailable()),
      limit: this.formatMoney(this.client()?.creditLimit || 0),
    });
  }

  pendingDocuments(): number {
    return this.snapshot()?.documents.filter((document) => /pending|review/i.test(document.status)).length ?? 0;
  }

  orderPreview(): Order[] {
    return this.orders().slice(0, 4);
  }

  requestPreview(): BuyerRequest[] {
    return this.requests().slice(0, 3);
  }

  catalogPreview(): Product[] {
    return this.products().slice(0, 4);
  }

  activePromos(): BuyerPromotion[] {
    return (this.snapshot()?.promotions ?? [])
      .filter((promotion) => !promotion.status || promotion.status === 'active')
      .slice(0, 3);
  }

  promotionTitle(promotion: BuyerPromotion): string {
    return promotion.name || promotion.title;
  }

  promotionSummary(promotion: BuyerPromotion): string {
    const label = promotion.discountLabel || promotion.description;
    return promotion.notes ? `${label} - ${promotion.notes}` : label;
  }

  requestedDeliveryCopy(order: Order): string {
    const extra = order as Order & { requestedDeliveryDate?: string; totalEstimatedWeightKg?: number | string };
    return this.i18n.t('portal.homePanel.requestedDelivery', {
      date: extra.requestedDeliveryDate || '',
      weight: extra.totalEstimatedWeightKg || '',
    });
  }

  requestStatusCopy(request: BuyerRequest): string {
    return this.i18n.t('portal.homePanel.requestStatus', {
      code: request.id,
      status: this.statusLabel(request.status),
    });
  }

  trackingSteps(): { key: string; index: number; label: string; dateLabel: string; state: string }[] {
    const order = this.activeOrder();
    const orderEvents = this.snapshot()?.orderEvents.filter((event) => event.orderId === order?.id) ?? [];
    const eventStatus = new Set(orderEvents.map((event) => event.status));
    const defs = [
      ['received', 'portal.homePanel.stepRequestReceived'],
      ['validating', 'portal.homePanel.stepCommercialValidation'],
      ['confirmed', 'portal.homePanel.stepPurchaseOrderConfirmed'],
      ['documents', 'portal.homePanel.stepBusinessDocuments'],
      ['operations', 'portal.homePanel.stepReadyOperations'],
      ['route', 'portal.homePanel.stepReadyRoute'],
      ['preparing', 'portal.homePanel.stepPreparingDispatch'],
      ['on_route', 'portal.homePanel.stepOnRoute'],
      ['delivered', 'portal.homePanel.stepDelivered'],
    ] as const;
    return defs.map(([key, labelKey], index) => ({
      key,
      index: index + 1,
      label: this.i18n.t(labelKey),
      dateLabel: eventStatus.has(key) ? this.i18n.t('portal.status.active') : this.i18n.t('portal.status.pending'),
      state: eventStatus.has(key) ? 'active' : '',
    }));
  }

  private recentOrders(): Order[] {
    return [...this.orders()].sort((a, b) => this.orderTime(b) - this.orderTime(a));
  }

  private recentRequests(): BuyerRequest[] {
    return [...this.requests()].sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
  }

  private orderTime(order: Order): number {
    const eventTimes = (this.snapshot()?.orderEvents ?? [])
      .filter((event) => event.orderId === order.id)
      .map((event) => Date.parse(event.timestamp || ''))
      .filter((time) => Number.isFinite(time));
    return Math.max(Date.parse(order.date || '') || 0, ...eventTimes);
  }

  private formatMoney(value: number): string {
    return Number(value || 0).toLocaleString('en-US');
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
}
