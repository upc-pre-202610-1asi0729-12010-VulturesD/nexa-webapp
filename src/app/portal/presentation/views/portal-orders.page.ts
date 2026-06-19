import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortalSnapshot } from '@app/portal/domain/model';
import { Order } from '@app/ordering/domain/model';
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

const ORDER_STATUS_FLOW = ['pending', 'submitted', 'validating', 'confirmed', 'document_pending', 'ready_for_dispatch', 'ready_for_route', 'preparing', 'in_route', 'delivered'];

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
    selector: 'nx-portal-orders',
    imports: [CommonModule, RouterLink, TranslatePipe, NexaIconComponent],
    template: `
    <div class="buyer-page">
      <header class="portal-page-header">
        <div>
          <h1 class="portal-page-title">{{ 'portal.nav.orders' | t }}</h1>
          <p class="portal-page-subtitle">{{ sectionSubtitleCopy() }}</p>
        </div>
        <a routerLink="/portal/product-catalog" class="primary-btn"><nx-icon name="pi-plus"></nx-icon>{{ 'portal.orders.newRequest' | t }}</a>
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
            @for (order of ordersForDisplay(data); track order.id) {
              <article class="buyer-card flow-panel-pad">
                <div class="flow-row-between buyer-record-head">
                  <div>
                    <div class="flow-row" style="margin-bottom:5px">
                      <strong class="text-mono buyer-current-code">{{ order.id }}</strong>
                      <span class="flow-pill" [ngClass]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                    </div>
                    <div class="flow-note">{{ orderCreatedDate(order) }} - {{ order.items.length }} item(s) - {{ orderWeight(order) }} kg</div>
                  </div>
                  <div class="buyer-order-total">
                    <div style="font-weight: 700; margin-bottom: 4px;">S/ {{ moneyNoComma(order.total) }}</div>
                    <a [routerLink]="['/portal/purchase-orders', order.id]" class="primary-btn btn-sm">{{ 'portal.documents.tracking' | t }}</a>
                  </div>
                </div>
                <div class="flow-timeline-horizontal" style="margin-top: 18px;">
                  @for (step of orderTrackingSteps(data, order); track step.key) {
                    <div class="flow-track-step" [ngClass]="step.state">
                      <div class="flow-track-index">{{ step.index }}</div>
                      <div class="flow-track-label">{{ step.label }}</div>
                      <div class="flow-track-date">{{ step.dateLabel }}</div>
                    </div>
                  }
                </div>
              </article>
            }
          </div>
        }
      }
    </div>
  `
})
export class PortalOrdersPage {
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
      return this.i18n.t('portal.sections.orders.subtitle', { count: snapshot.myOrders.length });
    }
    return '';
  }

  ordersForDisplay(snapshot: PortalSnapshot): Order[] {
    return [...snapshot.myOrders].sort((a, b) => this.orderTimestamp(snapshot, b) - this.orderTimestamp(snapshot, a));
  }

  orderCreatedDate(order: Order): string {
    return (order as any).createdAt?.slice(0, 10) || order.date || '';
  }

  orderWeight(order: Order): string {
    return String((order as any).totalEstimatedWeightKg || '0');
  }

  moneyNoComma(value: number): string {
    return Number(value || 0).toFixed(2);
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

  orderStepState(status: string, step: string): string {
    if (['blocked', 'cancelled', 'rejected'].includes(status)) {
      return step === 'validating' ? 'active' : 'pending';
    }
    const aliases: Record<string, string> = { dispatched: 'in_route', ready_for_operations: 'ready_for_dispatch' };
    const normalizedStatus = aliases[status] || status;
    const normalizedStep = aliases[step] || step;
    const target = ORDER_STATUS_FLOW.indexOf(normalizedStep);
    const normalizedCurrent = ORDER_STATUS_FLOW.indexOf(normalizedStatus);
    if (normalizedCurrent < 0 || target < 0) return 'pending';
    if (target < normalizedCurrent) return 'done';
    if (target === normalizedCurrent) return 'active';
    return 'pending';
  }

  normalizeOrderStatus(status: string): string {
    const statusAliases: Record<string, string> = {
      ready_for_operations: 'ready_for_dispatch',
      dispatched: 'in_route',
      document_ready: 'document_pending',
      documents_prepared: 'document_pending',
      approved: 'validating',
      converted_to_order: 'confirmed',
    };
    return statusAliases[status] || status;
  }

  timelineEventForStep(events: any[], step: string) {
    const normalizedStep = this.normalizeOrderStatus(step);
    return [...events]
      .filter(event => this.normalizeOrderStatus(event.status) === normalizedStep)
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

  orderTrackingSteps(snapshot: PortalSnapshot, order: Order): TrackingStep[] {
    const visibleEvents = snapshot.orderEvents.filter(event => event.orderId === order.id && event.visibleToBuyer !== false);
    return ORDER_TRACKING_STEPS.map(([key, labelKey], index) => {
      const event = this.timelineEventForStep(visibleEvents, key);
      return {
        key,
        label: this.i18n.t(labelKey),
        index: index + 1,
        state: this.orderStepState(order.status, key),
        dateLabel: this.formatTimelineDateTime(event?.timestamp || event?.createdAt),
      };
    });
  }

  private orderTimestamp(snapshot: PortalSnapshot, order: Order): number {
    const eventTimes = snapshot.orderEvents
      .filter((event) => event.orderId === order.id)
      .map((event) => Date.parse(event.timestamp || ''))
      .filter((time) => Number.isFinite(time));
    return Math.max(Date.parse(order.date || '') || 0, ...eventTimes);
  }
}
