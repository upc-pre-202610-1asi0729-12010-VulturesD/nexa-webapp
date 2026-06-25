import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DashboardStore } from '@app/dashboard/application/dashboard.store';
import { Product } from '@app/catalog/domain/model';
import { Dispatch, ProofOfDelivery } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

@Component({
    selector: 'nx-operations-dashboard',
    imports: [CommonModule],
    template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="page-title">Operations Dashboard</div>
          <div class="page-subtitle">Monitor inventory, dispatch orders, delivery status and critical alerts.</div>
        </div>
        <button class="btn btn-primary" (click)="go('/dispatches')">
          <i class="pi pi-send" aria-hidden="true"></i> Dispatch Orders
        </button>
      </div>

      <div class="flow-action-banner">
        <div>
          <div class="flow-eyebrow">S1 validates -> S2 executes</div>
          <div class="flow-title">
            {{ dispatchOrdersToday().length }} active dispatch orders, {{ pendingPod().length }} pending proof-of-delivery records and {{ expiringLots().length }} FEFO-priority lots.
          </div>
          <div class="flow-note">Use the board to move from document readiness to preparation, route and POD.</div>
        </div>
        <button class="btn btn-secondary" (click)="go('/proof-of-delivery')">
          <i class="pi pi-camera" aria-hidden="true"></i> Proof of Delivery
        </button>
      </div>

      <div class="grid-4" style="margin-bottom:18px" role="region" aria-label="KPIs">
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-database" style="color:#EF4444" aria-hidden="true"></i> Critical Stock</div>
          <div class="kpi-value" style="color:#EF4444">{{ lowStock().length }}</div>
          <div class="kpi-sub">Below minimum or out of stock</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-clock" style="color:#F59E0B" aria-hidden="true"></i> FEFO Lots</div>
          <div class="kpi-value" style="color:#F59E0B">{{ expiringLots().length }}</div>
          <div class="kpi-sub">Expire in 30 days or less</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB" aria-hidden="true"></i> Active Dispatch Orders</div>
          <div class="kpi-value" style="color:#2563EB">{{ dispatchOrdersToday().length }}</div>
          <div class="kpi-sub">Validating, preparing or on route</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label"><i class="pi pi-camera" style="color:#4F46E5" aria-hidden="true"></i> Pending POD</div>
          <div class="kpi-value" style="color:#4F46E5">{{ pendingPod().length }}</div>
          <div class="kpi-sub">{{ incidents().length }} open incidents</div>
        </div>
      </div>

      <div class="flow-grid-12">
        <section class="flow-panel span-7">
          <div class="flow-panel-head">
            <div>
              <div class="flow-title">Dispatch Board preview</div>
              <div class="flow-subtitle">Cards ready to move through operations.</div>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="go('/dispatches')">Dispatch Orders</button>
          </div>
          <div class="flow-panel-pad flow-stack">
            @for (dispatch of dispatches().slice(0, 5); track dispatch.id) {
              <div class="flow-list-item">
                <div>
                  <div class="flow-row" style="margin-bottom:5px">
                    <span class="mono">{{ displayCode(dispatch) }}</span>
                    <span class="badge" [class]="orderStatusBadge(dispatch.status)">{{ orderStatusLabel(dispatch.status) }}</span>
                    <span class="badge" [class]="creditFor(dispatch).badgeClass">{{ creditFor(dispatch).statusLabel }}</span>
                  </div>
                  <div style="font-size:13px;font-weight:800">{{ clientName(dispatch.clientAccountId) }}</div>
                  <div class="flow-note">
                    {{ dispatch.routeName }} - ETA {{ formatEta(dispatch.eta) }} - Credit available S/ {{ creditFor(dispatch).available | number:'1.0-0' }}
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" (click)="go('/dispatches/' + dispatch.id)">Open</button>
              </div>
            }
          </div>
        </section>

        <section class="flow-panel span-5">
          <div class="flow-panel-head"><div class="flow-title">Operational Alerts</div></div>
          <div class="flow-panel-pad flow-stack">
            @for (product of lowStock(); track product.id) {
              <div class="flow-list-item">
                <div>
                  <div style="font-weight:800">{{ product.name }}</div>
                  <div class="flow-note">Available {{ (product.stock || 0) - (product.reserved || 0) }} {{ product.unit }} / minimum {{ product.minStock }}</div>
                </div>
                <span class="badge" [class]="product.status === 'out' ? 'badge-red' : 'badge-amber'">{{ product.status }}</span>
              </div>
            }
            @for (lot of expiringLots().slice(0, 3); track lot.id) {
              <div class="flow-list-item">
                <div>
                  <div style="font-weight:800">{{ productName(lot.productId) }}</div>
                  <div class="flow-note">{{ lot.id }} due {{ lot.expiry }} - FEFO {{ lot.fefoPriority }}</div>
                </div>
                <span class="badge badge-amber">{{ daysUntil(lot.expiry) }} days</span>
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
  `,
    styles: [`
    .quick-action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      padding: 16px;
    }
    .quick-action-grid button {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      padding: 14px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
    }
    .quick-action-grid button i {
      font-size: 16px;
    }
  `]
})
export class OperationsDashboardPage {
  private readonly api = inject(DashboardStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly products = signal<Product[]>([]);
  readonly dispatches = signal<Dispatch[]>([]);
  readonly proofs = signal<ProofOfDelivery[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly lots = signal<InventoryLot[]>([]);

  readonly lowStock = computed(() =>
    this.products().filter((p) => ['low', 'out'].includes(p.status || ''))
  );
  readonly expiringLots = computed(() =>
    this.lots().filter((l) => this.daysUntil(l.expiry || l.expirationDate) <= 30)
  );
  readonly dispatchOrdersToday = computed(() =>
    this.dispatches().filter((d) => d.status !== 'delivered')
  );
  readonly pendingPod = computed(() =>
    this.dispatches().filter((dispatch) => dispatch.status === 'delivered'
      && !this.proofs().some((proof) => proof.dispatchOrderId === dispatch.id && ['complete', 'completed'].includes(proof.status)))
  );
  readonly incidents = computed(() =>
    this.dispatches().filter((d) => d.status === 'incident')
  );

  constructor() {
    forkJoin({
      products: this.api.products(),
      dispatches: this.api.dispatches(),
      proofs: this.api.proofsOfDelivery(),
      clients: this.api.clients(),
      lots: this.api.lots(),
    }).subscribe({
      next: ({ products, dispatches, proofs, clients, lots }) => {
        this.products.set(products);
        this.dispatches.set(dispatches);
        this.proofs.set(proofs);
        this.clients.set(clients);
        this.lots.set(lots);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.t('dashboard.loadUnavailable'));
        this.loading.set(false);
      },
    });
  }

  creditFor(dispatch: Dispatch) {
    const client = this.clients().find((c) => Number(c.id) === dispatch.clientAccountId);
    const limit = Number(client?.creditLimit ?? 0);
    const used = Number(client?.creditUsed ?? 0);
    const available = Math.max(0, limit - used);
    const status = limit && used >= limit ? 'blocked' : (limit && (used / limit) >= 0.85 ? 'attention' : 'ok');
    const statusLabel = { ok: 'Credit OK', attention: 'Credit attention', overdue: 'Overdue', blocked: 'Blocked' }[status] || status;
    const badgeClass = { ok: 'badge-green', attention: 'badge-amber', overdue: 'badge-red', blocked: 'badge-red' }[status] || 'badge-gray';
    return { available, statusLabel, badgeClass };
  }

  go(path: string): void {
    void this.router.navigate([path]);
  }

  displayCode(dispatch: Dispatch): string {
    return dispatch.code || String(dispatch.id);
  }

  clientName(id: number): string {
    return this.clients().find((c) => Number(c.id) === id)?.name ?? `#${id}`;
  }

  productName(id: string): string {
    return this.products().find((p) => p.id === id)?.name ?? id;
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
      ready_for_dispatch: 'badge-blue',
      ready_for_operations: 'badge-blue',
      ready_for_route: 'badge-blue',
      in_route: 'badge-blue',
      incident: 'badge-red'
    };
    return map[s] ?? 'badge-gray';
  }

  daysUntil(dateStr?: string): number {
    if (!dateStr) return 99999;
    const target = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
  }

  formatEta(eta?: string | null): string {
    if (!eta) return '';
    return new Date(eta).toLocaleString('en-US');
  }
}
