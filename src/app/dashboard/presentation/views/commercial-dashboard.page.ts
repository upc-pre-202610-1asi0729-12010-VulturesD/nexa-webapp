import { Component, computed, inject, signal } from '@angular/core';

import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DashboardStore } from '@app/dashboard/application/dashboard.store';
import { ActivityEntry, BusinessDocument } from '@app/dashboard/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Client } from '@app/clients/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';

@Component({
    selector: 'nx-commercial-dashboard',
    imports: [TranslatePipe],
    template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'commercialDashboard.title' | t }}</div>
          <div class="page-subtitle">{{ 'commercialDashboard.subtitle' | t }}</div>
        </div>
        <div class="flow-row">
          <button class="btn btn-secondary" (click)="go('/commercial/purchase-requests')">
            <i class="pi pi-inbox" aria-hidden="true"></i> {{ 'commercialDashboard.requestsButton' | t }}
          </button>
          <button class="btn btn-primary" (click)="go('/orders/new')">
            <i class="pi pi-plus" aria-hidden="true"></i> {{ 'commercialDashboard.manualOrder' | t }}
          </button>
        </div>
      </div>

      <div class="flow-action-banner">
        <div>
          <div class="flow-eyebrow">{{ 'commercialDashboard.bannerEyebrow' | t }}</div>
          <div class="flow-title">{{ bannerTitle() }}</div>
          <div class="flow-note">{{ 'commercialDashboard.bannerNote' | t }}</div>
        </div>
        <button class="btn btn-primary" (click)="go('/commercial/business-documents')">
          <i class="pi pi-file-check" aria-hidden="true"></i> {{ 'commercialDashboard.businessDocuments' | t }}
        </button>
      </div>

      <div class="grid-4" style="margin-bottom:18px" role="region" aria-label="KPIs">
        <div class="card kpi-card">
          <div class="flow-row-between">
            <div class="kpi-label"><i class="pi pi-inbox" style="color:#2563EB" aria-hidden="true"></i> {{ 'commercialDashboard.newRequests' | t }}</div>
            <div class="flow-kpi-icon"><i class="pi pi-inbox" aria-hidden="true"></i></div>
          </div>
          <div class="kpi-value" style="color:#2563EB">{{ newRequests().length }}</div>
          <div class="kpi-sub">{{ 'commercialDashboard.newRequestsSub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="flow-row-between">
            <div class="kpi-label"><i class="pi pi-search" style="color:#F59E0B" aria-hidden="true"></i> {{ 'commercialDashboard.inValidation' | t }}</div>
            <div class="flow-kpi-icon" style="background:#FEF3C7;color:#B45309"><i class="pi pi-search" aria-hidden="true"></i></div>
          </div>
          <div class="kpi-value" style="color:#F59E0B">{{ validatingOrders().length }}</div>
          <div class="kpi-sub">{{ 'commercialDashboard.inValidationSub' | t }}</div>
        </div>
        <div class="card kpi-card">
          <div class="flow-row-between">
            <div class="kpi-label"><i class="pi pi-file" style="color:#0891B2" aria-hidden="true"></i> {{ 'commercialDashboard.pendingDocs' | t }}</div>
            <div class="flow-kpi-icon" style="background:#ECFEFF;color:#0891B2"><i class="pi pi-file" aria-hidden="true"></i></div>
          </div>
          <div class="kpi-value" style="color:#0891B2">{{ pendingDocs().length }}</div>
          <div class="kpi-sub">{{ pendingDocsSub() }}</div>
        </div>
        <div class="card kpi-card">
          <div class="flow-row-between">
            <div class="kpi-label"><i class="pi pi-ban" style="color:#EF4444" aria-hidden="true"></i> {{ 'commercialDashboard.blocked' | t }}</div>
            <div class="flow-kpi-icon" style="background:#FEE2E2;color:#B91C1C"><i class="pi pi-ban" aria-hidden="true"></i></div>
          </div>
          <div class="kpi-value" style="color:#EF4444">{{ blockedOrders().length }}</div>
          <div class="kpi-sub">{{ 'commercialDashboard.blockedSub' | t }}</div>
        </div>
      </div>

      <div class="flow-grid-12">
        <section class="flow-panel span-7">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">{{ 'commercialDashboard.requestInbox' | t }}</div>
              <div class="flow-subtitle">{{ 'commercialDashboard.requestInboxSub' | t }}</div>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="go('/commercial/purchase-requests')">{{ 'commercialDashboard.viewAll' | t }}</button>
          </div>
          <div class="flow-panel-pad">
            @for (request of newRequests().slice(0, 5); track request.id) {
              <div class="flow-list-item">
                <div>
                  <div class="flow-row" style="margin-bottom:5px">
                    <span class="mono">{{ request.id }}</span>
                    <span class="badge" [class]="orderStatusBadge(request.status)">{{ orderStatusLabel(request.status) }}</span>
                    <span [class]="'badge-priority-' + (request.priority || 'medium')">{{ priorityLabel(request.priority) }}</span>
                  </div>
                  <div style="font-size:13px;font-weight:700;color:#0F172A">{{ clientName(request.clientId) }}</div>
                  <div class="flow-note">{{ request.notes || ('commercialDashboard.defaultRequestNote' | t) }}</div>
                </div>
                <button class="btn btn-primary btn-sm" (click)="go('/orders/' + request.id)">{{ 'common.review' | t }}</button>
              </div>
            }
          </div>
        </section>

        <section class="flow-panel span-5">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">{{ 'commercialDashboard.pendingBusinessDocs' | t }}</div>
              <div class="flow-subtitle">{{ 'commercialDashboard.pendingBusinessDocsSub' | t }}</div>
            </div>
          </div>
          <div class="flow-panel-pad">
            @for (doc of pendingDocs().slice(0, 6); track doc.id) {
              <div class="document-check">
                <div>
                  <div style="font-size:13px;font-weight:700">{{ doc.id }}</div>
                  <div class="flow-note">{{ doc.orderId }} - {{ clientName(doc.clientId) }}</div>
                </div>
                <span class="badge" [class]="orderStatusBadge(doc.status)">{{ orderStatusLabel(doc.status) }}</span>
              </div>
            }
          </div>
        </section>

      </div>

      @if (error()) {
        <div class="banner banner-info" style="margin-top: 16px;">
          <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
          <span>{{ error() }}</span>
        </div>
      }
    </div>
  `
})
export class CommercialDashboardPage {
  private readonly api = inject(DashboardStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activity = signal<ActivityEntry[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly documents = signal<BusinessDocument[]>([]);
  readonly clients = signal<Client[]>([]);

  readonly newRequests = computed(() =>
    this.orders().filter((o) => ['validating', 'blocked', 'confirmed'].includes(o.status))
  );
  readonly validatingOrders = computed(() =>
    this.orders().filter((o) => o.status === 'validating')
  );
  readonly pendingDocs = computed(() =>
    this.documents().filter((document) => document.required && !['accepted', 'available'].includes(document.status))
  );
  readonly blockedOrders = computed(() =>
    this.orders().filter((o) => o.status === 'blocked')
  );
  readonly pendingCreditRequests = computed(() =>
    this.orders().filter((o) => o.status === 'blocked')
  );

  constructor() {
    forkJoin({
      activity: this.api.activity(),
      orders: this.api.orders(),
      documents: this.api.businessDocuments(),
      clients: this.api.clients(),
    }).subscribe({
      next: ({ activity, orders, documents, clients }) => {
        this.activity.set(activity);
        this.orders.set(orders);
        this.documents.set(documents);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.t('dashboard.loadUnavailable'));
        this.loading.set(false);
      },
    });
  }

  bannerTitle(): string {
    return this.i18n.t('commercialDashboard.bannerTitle', {
      requests: this.newRequests().length,
      credit: this.pendingCreditRequests().length,
      documents: this.pendingDocs().length,
    });
  }

  pendingDocsSub(): string {
    return this.i18n.t('commercialDashboard.pendingDocsSub', { count: this.pendingDocs().length });
  }

  requestedAmountLabel(order: Order): string {
    return this.i18n.t('commercialDashboard.requestedAmount', {
      amount: Number(order.total || 0).toLocaleString(),
      reason: order.notes || this.i18n.t('commercialDashboard.blockedSub'),
    });
  }

  go(path: string): void {
    void this.router.navigate([path]);
  }

  clientName(id: string): string {
    return this.clients().find((c) => c.id === id)?.name ?? id;
  }

  orderStatusLabel(s: string): string {
    const translated = this.i18n.t('orders.status.' + s);
    return translated === 'orders.status.' + s ? s.replace(/_/g, ' ') : translated;
  }

  orderStatusBadge(s: string): string {
    const map: Record<string, string> = {
      validating: 'badge-amber',
      blocked: 'badge-red',
      preparing: 'badge-blue',
      confirmed: 'badge-blue',
      dispatched: 'badge-purple',
      delivered: 'badge-green',
      cancelled: 'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  priorityLabel(p?: string): string {
    return this.i18n.t('priority.' + (p || 'medium'));
  }

  activityColor(type?: string): string {
    if (type === 'success' || type === 'ok') return '#22C55E';
    if (type === 'warning' || type === 'warn') return '#F59E0B';
    if (type === 'danger' || type === 'error') return '#EF4444';
    return '#2563EB';
  }
}
