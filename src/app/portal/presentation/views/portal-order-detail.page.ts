import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order } from '@app/ordering/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
    selector: 'nx-portal-order-detail',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!order()) {
        <div class="empty-state">
          <div class="empty-state-icon"><nx-icon name="pi-search"></nx-icon></div>
          <div class="empty-state-title">{{ 'portal.detail.orderNotFound' | t }}</div>
          <a routerLink="/portal/purchase-orders" class="primary-btn">{{ 'portal.detail.backOrders' | t }}</a>
        </div>
      } @else {
        @if (order(); as item) {
          <div class="flow-row" style="margin-bottom:4px;flex-wrap:wrap">
            <a routerLink="/portal/purchase-orders" class="btn btn-ghost btn-sm"><i class="pi pi-arrow-left"></i>{{ 'portal.detail.backOrders' | t }}</a>
            <span class="flow-pill" [ngClass]="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
          </div>
          <section class="buyer-shell-band portal-section-hero">
            <div>
              <div class="flow-eyebrow">{{ 'portal.orders.title' | t }}</div>
              <h1 class="buyer-title">{{ item.id }}</h1>
              <p class="buyer-subtitle">{{ 'portal.detail.orderTrackingCopy' | t }}</p>
            </div>
            <div class="buyer-hero-panel">
              <span>{{ 'portal.orders.delivery' | t }}</span>
              <strong>{{ item.deliveryDate || item.date }}</strong>
              <span>{{ item.items.length }} {{ 'portal.orders.items' | t }} · S/ {{ item.total | number:'1.2-2' }}</span>
            </div>
          </section>
          <div class="flow-grid-12">
            <section class="flow-panel span-8">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'orderDetail.products' | t }}</div>
                  <div class="flow-subtitle">{{ 'portal.detail.orderProductsCopy' | t }}</div>
                </div>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>{{ 'orderDetail.product' | t }}</th>
                      <th>{{ 'orderDetail.qty' | t }}</th>
                      <th>{{ 'orderDetail.price' | t }}</th>
                      <th>{{ 'orderDetail.subtotal' | t }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of item.items; track line.productId) {
                      <tr>
                        <td>{{ productName(line.productId) }}</td>
                        <td>{{ line.qty }}</td>
                        <td>S/ {{ line.price | number:'1.2-2' }}</td>
                        <td><strong>S/ {{ line.qty * line.price | number:'1.2-2' }}</strong></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
            <aside class="flow-panel span-4">
              <div class="flow-panel-pad flow-stack">
                <div class="flow-eyebrow">{{ 'orderDetail.timeline' | t }}</div>
                @for (step of timeline(item); track step.label) {
                  <div class="tl-item">
                    <div class="tl-dot" [style.background]="step.done ? '#DCFCE7' : '#F3F4F6'">
                      <i [class]="step.done ? 'pi pi-check' : 'pi pi-clock'" [style.color]="step.done ? '#15803D' : '#9CA3AF'"></i>
                    </div>
                    <div class="tl-content">
                      <div class="tl-title">{{ step.label }}</div>
                      <div class="tl-meta">{{ step.copy }}</div>
                    </div>
                  </div>
                }
                <a routerLink="/portal/business-documents" class="secondary-btn">{{ 'portal.nav.documents' | t }}</a>
              </div>
            </aside>
            <section class="flow-panel span-6">
              <div class="flow-panel-head">
                <div class="flow-title">{{ 'portal.detail.availableDocuments' | t }}</div>
                <a routerLink="/portal/business-documents" class="btn btn-ghost btn-sm">{{ 'portal.actions.viewAll' | t }}</a>
              </div>
              <div class="flow-panel-pad">
                @for (document of documents(item.id); track document.id) {
                  <div class="document-check">
                    <div>
                      <div style="font-weight:800">{{ document.label || document.type }}</div>
                      <div class="flow-note">{{ document.fileName || document.id }}</div>
                    </div>
                    <div class="flow-row">
                      <span class="flow-pill" [ngClass]="statusClass(document.status)">{{ statusLabel(document.status) }}</span>
                      <button type="button" class="secondary-btn" [disabled]="!document.visibleToBuyer">{{ 'portal.documents.download' | t }}</button>
                    </div>
                  </div>
                }
              </div>
            </section>
            <section class="flow-panel span-6">
              <div class="flow-panel-head"><div class="flow-title">{{ 'portal.detail.visibleEvents' | t }}</div></div>
              <div class="flow-panel-pad flow-stack">
                @for (event of events(item.id); track event.id) {
                  <div class="tl-item">
                    <div class="tl-dot" style="background:#DBEAFE;color:#1D4ED8"><nx-icon name="pi-check"></nx-icon></div>
                    <div class="tl-content">
                      <div class="tl-title">{{ event.label }}</div>
                      <div class="tl-meta">{{ event.timestamp | date:'short' }}</div>
                    </div>
                  </div>
                }
              </div>
            </section>
            <section class="flow-panel span-12">
              <div class="flow-panel-head">
                <div class="flow-title">{{ 'portal.detail.mapTemperature' | t }}</div>
                <span class="premium-badge"><nx-icon name="pi-lock"></nx-icon>{{ 'portal.premium.preview' | t }}</span>
              </div>
              <div class="flow-panel-pad flow-stack">
                <div class="banner banner-info" style="margin-bottom:0">
                  <nx-icon name="pi-map"></nx-icon>
                  <div>{{ 'portal.detail.mapTemperatureCopy' | t }}</div>
                </div>
                @for (log of temperatureLogs(item.id); track log.id) {
                  <div class="flow-row-between">
                    <span>{{ log.timestamp | date:'shortTime' }}</span>
                    <strong>{{ log.temperatureC }} C - {{ log.status }}</strong>
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
export class PortalOrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly snapshot = signal<PortalSnapshot | null>(null);
  readonly orderId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });
  readonly order = computed(() => this.snapshot()?.myOrders.find((item) => item.id === this.orderId()) ?? null);

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

  productName(id: string): string {
    return this.snapshot()?.products.find((item) => item.id === id)?.name ?? id;
  }

  timeline(order: Order): Array<{ label: string; copy: string; done: boolean }> {
    const status = order.status;
    return [
      { label: this.i18n.t('portal.detail.timelineValidated'), copy: this.i18n.t('portal.detail.timelineValidatedCopy'), done: true },
      { label: this.i18n.t('portal.detail.timelinePrepared'), copy: this.i18n.t('portal.detail.timelinePreparedCopy'), done: /preparing|dispatched|delivered/i.test(status) },
      { label: this.i18n.t('portal.detail.timelineDispatched'), copy: this.i18n.t('portal.detail.timelineDispatchedCopy'), done: /dispatched|delivered/i.test(status) },
      { label: this.i18n.t('portal.detail.timelineDelivered'), copy: this.i18n.t('portal.detail.timelineDeliveredCopy'), done: /delivered/i.test(status) },
    ];
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

  documents(orderId: string) {
    return this.snapshot()?.documents.filter((document) => document.orderId === orderId) ?? [];
  }

  events(orderId: string) {
    return this.snapshot()?.orderEvents.filter((event) => event.orderId === orderId) ?? [];
  }

  temperatureLogs(orderId: string) {
    return this.snapshot()?.temperatureLogs.filter((log) => log.orderId === orderId) ?? [];
  }
}
