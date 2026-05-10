import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Dispatch } from '@app/dispatch/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

@Component({
  selector: 'nx-analytics',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ (isLogistics() ? 'reports.titleLogistics' : 'reports.titleCommercial') | t }}</div>
          <div class="page-subtitle">Nexa Cold Chain · {{ (isLogistics() ? 'reports.subtitleLogistics' : 'reports.subtitleCommercial') | t }}</div>
        </div>
      </div>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else {
        <div class="grid-4" style="margin-bottom:20px">
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-file-edit" style="color:#2563EB"></i> {{ 'reports.activeOrders' | t }}</div>
            <div class="kpi-value" style="color:#2563EB">{{ activeOrders() }}</div>
            <div class="kpi-sub">{{ i18n.t('reports.ofPeriod', { total: orders().length }) }}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E"></i> {{ 'reports.completedDeliveries' | t }}</div>
            <div class="kpi-value" style="color:#22C55E">{{ deliveredOrders() }}</div>
            <div class="kpi-sub">{{ i18n.t('reports.billed', { amount: totalRevenue().toFixed(2) }) }}</div>
          </div>
          @if (isLogistics()) {
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-send" style="color:#F59E0B"></i> {{ 'reports.inTransit' | t }}</div>
              <div class="kpi-value" style="color:#F59E0B">{{ activeDispatches() }}</div>
              <div class="kpi-sub">{{ i18n.t('reports.withoutEvidence', { n: pendingEvidence() }) }}</div>
            </div>
          } @else {
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-wallet" style="color:#F59E0B"></i> {{ 'reports.pendingCollection' | t }}</div>
              <div class="kpi-value" style="color:#F59E0B">S/ {{ pendingRevenue() | number:'1.0-0' }}</div>
              <div class="kpi-sub">{{ 'reports.inPrepDispatch' | t }}</div>
            </div>
          }
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-ban" style="color:#EF4444"></i> {{ 'reports.blocked' | t }}</div>
            <div class="kpi-value" style="color:#EF4444">{{ blockedOrders() }}</div>
            <div class="kpi-sub">{{ 'reports.requireAction' | t }}</div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:20px">
          <div class="card" style="overflow:hidden">
            <div class="card-header"><span class="card-title">{{ 'reports.byStatus' | t }}</span></div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'reports.table.status' | t }}</th>
                  <th>{{ 'reports.table.count' | t }}</th>
                  <th>{{ 'reports.table.pct' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of statusCounts(); track row.status) {
                  <tr>
                    <td><span [class]="'badge ' + statusBadge(row.status)">{{ ('orders.status.' + row.status) | t }}</span></td>
                    <td style="font-weight:600">{{ row.count }}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div style="flex:1;height:6px;background:#F3F0EC;border-radius:9999px;overflow:hidden">
                          <div [style.width.%]="row.pct" style="height:100%;background:#2563EB;border-radius:9999px"></div>
                        </div>
                        <span style="font-size:11px;color:#6B7280;min-width:28px">{{ row.pct | number:'1.0-0' }}%</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="card card-pad">
            <div class="card-title" style="margin-bottom:16px">{{ 'reports.byCategory' | t }}</div>
            @if (categoryRevenue().length === 0) {
              <div style="text-align:center;color:#9CA3AF;font-size:13px;padding:20px 0">{{ 'reports.noSalesData' | t }}</div>
            } @else {
              @for (row of categoryRevenue(); track row.cat) {
                <div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                    <span style="color:#374151;font-weight:500">{{ row.cat }}</span>
                    <span style="color:#6B7280">S/ {{ row.val | number:'1.2-2' }}</span>
                  </div>
                  <div style="height:6px;background:#F3F0EC;border-radius:9999px;overflow:hidden">
                    <div [style.width.%]="row.pct" style="height:100%;background:#2563EB;border-radius:9999px"></div>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <div class="banner banner-info">
          <i class="pi pi-info-circle"></i>
          <div>{{ 'reports.demoBanner' | t }}</div>
        </div>
      }
    </div>
  `,
})
export class AnalyticsPage {
  private readonly http = inject(HttpClient);
  private readonly session = inject(IamStore);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly dispatches = signal<Dispatch[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isLogistics = computed(() => this.session.roleKey() === 'logistics');

  readonly activeOrders = computed(() => this.orders().filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length);
  readonly deliveredOrders = computed(() => this.orders().filter((o) => o.status === 'delivered').length);
  readonly blockedOrders = computed(() => this.orders().filter((o) => o.status === 'blocked').length);
  readonly totalRevenue = computed(() => this.orders().filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0));
  readonly pendingRevenue = computed(() => this.orders().filter((o) => ['confirmed', 'preparing', 'dispatched'].includes(o.status)).reduce((s, o) => s + o.total, 0));
  readonly activeDispatches = computed(() => this.dispatches().filter((d) => /transit/i.test(d.status)).length);
  readonly pendingEvidence = computed(() => this.dispatches().filter((d) => d.evidenceRequired && !d.evidenceDone).length);

  readonly statusCounts = computed(() => {
    const total = this.orders().length || 1;
    const map = new Map<string, number>();
    for (const o of this.orders()) map.set(o.status, (map.get(o.status) || 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ status, count, pct: (count / total) * 100 }));
  });

  readonly categoryRevenue = computed(() => {
    const map = new Map<string, number>();
    for (const p of this.products()) {
      const sales = this.orders()
        .filter((o) => o.status !== 'cancelled')
        .flatMap((o) => o.items)
        .filter((i) => i.productId === p.id)
        .reduce((s, i) => s + i.qty * i.price, 0);
      if (sales > 0) map.set(p.category, (map.get(p.category) || 0) + sales);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return entries.map(([cat, val]) => ({ cat, val, pct: (val / max) * 100 }));
  });

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      validating: 'badge-amber', blocked: 'badge-red',
      confirmed: 'badge-blue', preparing: 'badge-amber',
      dispatched: 'badge-blue', delivered: 'badge-green',
      cancelled: 'badge-red', rejected: 'badge-red',
    };
    return map[s] || 'badge-gray';
  }

  constructor() {
    forkJoin({
      orders: this.http.get<Order[]>('api/v1/orders'),
      dispatches: this.http.get<Dispatch[]>('api/v1/dispatches'),
      products: this.http.get<Product[]>('api/v1/products'),
    }).subscribe({
      next: ({ orders, dispatches, products }) => {
        this.orders.set(orders);
        this.dispatches.set(dispatches);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
