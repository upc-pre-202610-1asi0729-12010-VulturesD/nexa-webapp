import { Component, inject, signal, computed } from '@angular/core';
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

interface TrackingStep {
  key: string;
  index: number;
  label: string;
  dateLabel: string;
  state: string;
}

const ORDER_STATUS_FLOW = [
  'pending',
  'submitted',
  'validating',
  'confirmed',
  'document_pending',
  'ready_for_dispatch',
  'ready_for_route',
  'preparing',
  'in_route',
  'delivered',
];

const ORDER_TRACKING_STEPS = [
  ['submitted', 'portal.homePanel.stepRequestReceived'],
  ['validating', 'portal.homePanel.stepCommercialValidation'],
  ['confirmed', 'portal.homePanel.stepPurchaseOrderConfirmed'],
  ['document_pending', 'portal.homePanel.stepBusinessDocuments'],
  ['ready_for_dispatch', 'portal.homePanel.stepReadyOperations'],
  ['ready_for_route', 'portal.homePanel.stepReadyRoute'],
  ['preparing', 'portal.homePanel.stepPreparingDispatch'],
  ['in_route', 'portal.homePanel.stepOnRoute'],
  ['delivered', 'portal.homePanel.stepDelivered'],
] as const;

@Component({
  selector: 'nx-portal-order-tracking',
  imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
  template: `
    <div class="buyer-page">
      @if (loading()) {
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      } @else if (!order()) {
        <div class="empty-state" role="status">
          <div class="empty-state-icon"><nx-icon name="pi-search"></nx-icon></div>
          <div class="empty-state-title">{{ 'portal.detail.orderNotFound' | t }}</div>
          <a routerLink="/portal/purchase-orders" class="primary-btn">{{ 'portal.detail.backOrders' | t }}</a>
        </div>
      } @else {
        @if (order(); as item) {
          <div class="flow-row" style="margin-bottom:4px;flex-wrap:wrap">
            <a routerLink="/portal/purchase-orders" class="btn btn-ghost btn-sm">
              <i class="pi pi-arrow-left" aria-hidden="true"></i>{{ 'portal.detail.backOrders' | t }}
            </a>
            <a [routerLink]="['/portal/purchase-orders', item.id]" class="btn btn-ghost btn-sm">
              <nx-icon name="pi-list"></nx-icon>{{ 'tracking.viewOrderDetail' | t }}
            </a>
            <span class="flow-pill" [ngClass]="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
          </div>

          <section class="buyer-shell-band portal-section-hero" aria-labelledby="tracking-title">
            <div>
              <div class="flow-eyebrow">{{ 'portal.documents.tracking' | t }}</div>
              <h1 id="tracking-title" class="buyer-title">{{ item.id || ('tracking.title' | t) }}</h1>
              <p class="buyer-subtitle">{{ 'tracking.subtitle' | t }}</p>
            </div>
            <div class="buyer-hero-panel" aria-label="Order status">
              <span>{{ 'tracking.status' | t }}</span>
              <strong>{{ statusLabel(item.status) }}</strong>
              <span>{{ item.items.length }} {{ 'portal.orders.items' | t }} · S/ {{ item.total | number:'1.2-2' }}</span>
            </div>
          </section>

          <div class="flow-grid-12">
            <section class="flow-panel span-8" aria-labelledby="tracking-timeline-title">
              <div class="flow-panel-head">
                <div>
                  <div id="tracking-timeline-title" class="flow-title">{{ 'orderDetail.timeline' | t }}</div>
                  <div class="flow-subtitle">{{ 'tracking.timelineCopy' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad flow-stack">
                @for (step of trackingSteps(item); track step.key) {
                  <div class="tl-item">
                    <div class="tl-dot" [ngClass]="dotClass(step.state)">
                      <i [class]="step.state === 'pending' ? 'pi pi-clock' : 'pi pi-check'" aria-hidden="true"></i>
                    </div>
                    <div class="tl-content">
                      <div class="tl-title">{{ step.label }}</div>
                      <div class="tl-meta">{{ step.dateLabel }}</div>
                    </div>
                  </div>
                }
              </div>
            </section>

            <aside class="flow-panel span-4" aria-labelledby="tracking-events-title">
              <div class="flow-panel-pad flow-stack">
                <div id="tracking-events-title" class="flow-title">{{ 'portal.detail.visibleEvents' | t }}</div>
                @if (visibleEvents(item.id).length === 0) {
                  <div class="flow-note">{{ 'tracking.noEvents' | t }}</div>
                } @else {
                  @for (event of visibleEvents(item.id); track event.id) {
                    <div class="tl-item">
                      <div class="tl-dot flow-pill-blue"><nx-icon name="pi-check"></nx-icon></div>
                      <div class="tl-content">
                        <div class="tl-title">{{ event.label || statusLabel(event.status) }}</div>
                        <div class="tl-meta">{{ formatTimelineDateTime(event.timestamp) }}</div>
                      </div>
                    </div>
                  }
                }
              </div>
            </aside>

            <section class="flow-panel span-12" aria-labelledby="tracking-temperature-title">
              <div class="flow-panel-head">
                <div>
                  <div id="tracking-temperature-title" class="flow-title">{{ 'portal.detail.mapTemperature' | t }}</div>
                  <div class="flow-subtitle">{{ 'tracking.temperatureCopy' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad flow-stack">
                @if (temperatureLogs(item.id).length === 0) {
                  <div class="banner banner-info" style="margin-bottom:0">
                    <nx-icon name="pi-map"></nx-icon>
                    <div>{{ 'portal.detail.mapTemperatureCopy' | t }}</div>
                  </div>
                } @else {
                  @for (log of temperatureLogs(item.id); track log.id) {
                    <div class="flow-row-between">
                      <span>{{ formatTimelineDateTime(log.timestamp) }}</span>
                      <strong>{{ log.temperatureC }} C · {{ log.status }}</strong>
                    </div>
                  }
                }
              </div>
            </section>
          </div>
        }
      }
    </div>
  `,
})
export class PortalOrderTrackingPage {
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
      next: (snapshot) => {
        this.snapshot.set(snapshot);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  trackingSteps(order: Order): TrackingStep[] {
    const visibleEvents = this.visibleEvents(order.id);
    return ORDER_TRACKING_STEPS.map(([key, labelKey], index) => {
      const event = this.timelineEventForStep(visibleEvents, key);
      return {
        key,
        label: this.i18n.t(labelKey),
        index: index + 1,
        state: this.orderStepState(order.status, key),
        dateLabel: this.formatTimelineDateTime((event as any)?.timestamp || (event as any)?.createdAt),
      };
    });
  }

  visibleEvents(orderId: string) {
    return (this.snapshot()?.orderEvents ?? [])
      .filter((event) => event.orderId === orderId && event.visibleToBuyer !== false)
      .sort((a, b) => Date.parse(a.timestamp || '') - Date.parse(b.timestamp || ''));
  }

  temperatureLogs(orderId: string) {
    return (this.snapshot()?.temperatureLogs ?? [])
      .filter((log) => log.orderId === orderId)
      .sort((a, b) => Date.parse(a.timestamp || '') - Date.parse(b.timestamp || ''));
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

  dotClass(state: string): string {
    if (state === 'done') return 'badge-green';
    if (state === 'active') return 'badge-blue';
    return 'badge-gray';
  }

  orderStepState(status: string, step: string): string {
    if (['blocked', 'cancelled', 'rejected'].includes(status)) {
      return step === 'validating' ? 'active' : 'pending';
    }
    const current = ORDER_STATUS_FLOW.indexOf(this.normalizeOrderStatus(status));
    const target = ORDER_STATUS_FLOW.indexOf(this.normalizeOrderStatus(step));
    if (current < 0 || target < 0) return 'pending';
    if (target < current) return 'done';
    if (target === current) return 'active';
    return 'pending';
  }

  normalizeOrderStatus(status: string): string {
    const aliases: Record<string, string> = {
      ready_for_operations: 'ready_for_dispatch',
      dispatched: 'in_route',
      document_ready: 'document_pending',
      documents_prepared: 'document_pending',
      approved: 'validating',
      converted_to_order: 'confirmed',
    };
    return aliases[status] || status;
  }

  timelineEventForStep(events: any[], step: string) {
    const normalizedStep = this.normalizeOrderStatus(step);
    return [...events]
      .filter((event) => this.normalizeOrderStatus(event.status) === normalizedStep)
      .sort((a, b) => new Date(a.timestamp || a.createdAt || 0).getTime() - new Date(b.timestamp || b.createdAt || 0).getTime())
      .at(-1);
  }

  formatTimelineDateTime(value: any): string {
    if (!value) return this.i18n.lang() === 'es' ? 'Pendiente' : 'Pending';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this.i18n.lang() === 'es' ? 'Pendiente' : 'Pending';
    return date.toLocaleString(this.i18n.lang() === 'es' ? 'es-PE' : 'en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
