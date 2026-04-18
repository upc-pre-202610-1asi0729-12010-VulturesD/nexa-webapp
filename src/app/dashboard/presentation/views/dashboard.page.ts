import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DashboardApi } from '../../infrastructure/dashboard-api';
import { Alert, ActivityEntry } from '@app/dashboard/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/infrastructure/services/i18n.service';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';

@Component({
  selector: 'nx-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page">
      <div class="page-header" role="banner">
        <div>
          <div class="page-title">{{ 'dashboard.greeting' | t }}, {{ firstName() }}</div>
          <div class="page-subtitle">{{ todayLabel() }} · {{ user()?.roleName }}</div>
        </div>
        <button class="btn btn-primary" (click)="go('/orders/new')">
          <i class="pi pi-plus" aria-hidden="true"></i> {{ 'nav.createOrder' | t }}
        </button>
      </div>

      @if (filteredAlerts().length) {
        <div class="alert-strip" role="alert" aria-live="polite">
          <div class="alert-strip-header" (click)="alertsOpen.set(!alertsOpen())">
            <div class="alert-strip-title">
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              {{ filteredAlerts().length }} {{ 'dashboard.alertsTitle' | t }}
            </div>
            <i [class]="alertsOpen() ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
               style="color:#B91C1C;font-size:12px" aria-hidden="true"></i>
          </div>
          @if (alertsOpen()) {
            <div class="alert-strip-items">
              @for (a of filteredAlerts(); track a.id) {
                <div class="alert-item" [class]="'alert-item-' + (a.type || 'info')">
                  <div style="flex-shrink:0;margin-top:2px">
                    <i [class]="iconForAlert(a)" [style.color]="alertColor(a)" aria-hidden="true"></i>
                  </div>
                  <div class="alert-item-content">
                    <div class="alert-item-title" [style.color]="alertColor(a)">{{ a.title }}</div>
                    <div class="alert-item-desc">{{ a.desc }}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" (click)="handleAlert(a)">{{ a.action || ('common.review' | t) }}</button>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (isLogistics()) {
        <div class="grid-4" style="margin-bottom:16px" role="region" aria-label="KPIs">
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-exclamation-circle" style="color:#EF4444"></i> {{ 'dashboard.kpi.critical' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#FEE2E2"><i class="pi pi-database" style="color:#B91C1C"></i></div>
            </div>
            <div class="kpi-value" style="color:#EF4444">{{ lowStockCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.criticalSub' | t }}</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-clock" style="color:#F97316"></i> {{ 'dashboard.kpi.expiringLots' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#FFEDD5"><i class="pi pi-clock" style="color:#C2410C"></i></div>
            </div>
            <div class="kpi-value" style="color:#F97316">{{ expiringLotsCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.expiringLotsSub' | t }}</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-send" style="color:#2563EB"></i> {{ 'dashboard.kpi.dispatch' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#DBEAFE"><i class="pi pi-send" style="color:#1D4ED8"></i></div>
            </div>
            <div class="kpi-value" style="color:#2563EB">{{ inTransitCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.dispatchSub' | t }}</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-camera" style="color:#F59E0B"></i> {{ 'dashboard.kpi.evidence' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#FEF3C7"><i class="pi pi-camera" style="color:#B45309"></i></div>
            </div>
            <div class="kpi-value" style="color:#F59E0B">{{ pendingEvidenceCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.evidenceSub' | t }}</div>
          </div>
        </div>
      } @else {
        <div class="grid-4" style="margin-bottom:16px" role="region" aria-label="KPIs">
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-users" style="color:#2563EB"></i> {{ 'dashboard.kpi.activeClients' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#DBEAFE"><i class="pi pi-users" style="color:#1D4ED8"></i></div>
            </div>
            <div class="kpi-value" style="color:#2563EB">{{ activeClientsCount() }}</div>
            <div class="kpi-sub">de {{ clients().length }} totales</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-file-edit" style="color:#F97316"></i> {{ 'dashboard.kpi.inValidation' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#FFEDD5"><i class="pi pi-file-edit" style="color:#C2410C"></i></div>
            </div>
            <div class="kpi-value" style="color:#F97316">{{ validatingCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.inValidationSub' | t }}</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-lock" style="color:#EF4444"></i> {{ 'dashboard.kpi.blocked' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#FEE2E2"><i class="pi pi-ban" style="color:#B91C1C"></i></div>
            </div>
            <div class="kpi-value" style="color:#EF4444">{{ blockedCount() }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.blockedSub' | t }}</div>
          </div>
          <div class="card kpi-card">
            <div style="display:flex;align-items:flex-start;justify-content:space-between">
              <div class="kpi-label"><i class="pi pi-check-circle" style="color:#22C55E"></i> {{ 'dashboard.kpi.recentOrders' | t }}</div>
              <div class="kpi-icon-bubble" style="background:#DCFCE7"><i class="pi pi-check-circle" style="color:#15803D"></i></div>
            </div>
            <div class="kpi-value" style="color:#22C55E">{{ orders().length }}</div>
            <div class="kpi-sub">{{ 'dashboard.kpi.recentOrdersSub' | t }}</div>
          </div>
        </div>
      }

      <div class="dash-two-col">
        <div>
          <div class="card" style="overflow:hidden;margin-bottom:12px">
            <div class="card-header">
              <span class="card-title">{{ 'dashboard.reqAction' | t }}</span>
              <button class="btn btn-ghost btn-sm" (click)="go('/orders')">{{ 'dashboard.viewAll' | t }}</button>
            </div>
            @if (loading()) {
              <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
            } @else if (pendingOrders().length === 0) {
              <div class="empty-state" style="padding:32px 16px">
                <div class="empty-state-icon"><i class="pi pi-check-circle"></i></div>
                <div class="empty-state-title">Sin pedidos pendientes</div>
                <div class="empty-state-desc">Todo en orden por ahora.</div>
              </div>
            } @else {
              <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'dashboard.table.order' | t }}</th>
                    <th>{{ 'dashboard.table.client' | t }}</th>
                    <th>{{ 'dashboard.table.status' | t }}</th>
                    <th>{{ 'dashboard.table.priority' | t }}</th>
                    <th>{{ 'dashboard.table.note' | t }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of pendingOrders(); track o.id) {
                    <tr style="cursor:pointer" (click)="go('/orders/' + o.id)">
                      <td><span class="mono">{{ o.id }}</span></td>
                      <td style="font-weight:500;font-size:13px">{{ clientName(o.clientId) }}</td>
                      <td><span class="badge" [class]="orderStatusBadge(o.status)">{{ orderStatusLabel(o.status) }}</span></td>
                      <td><span [class]="'badge-priority-' + (o.priority || 'medium')">{{ priorityLabel(o.priority) }}</span></td>
                      <td style="font-size:12px;color:#6B7280;max-width:180px">{{ o.notes || '—' }}</td>
                      <td><button class="btn btn-ghost btn-sm">{{ 'common.review' | t }}</button></td>
                    </tr>
                  }
                </tbody>
              </table>
              </div>
            }
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="card card-pad">
            <div class="card-title" style="margin-bottom:12px">{{ 'dashboard.quickActions' | t }}</div>
            <div class="quick-actions">
              @if (isLogistics()) {
                <button class="btn btn-ghost qa-btn" (click)="go('/inventory')"><i class="pi pi-database"></i>{{ 'nav.inventory' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/dispatches')"><i class="pi pi-send"></i>{{ 'nav.dispatch' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/reports')"><i class="pi pi-chart-bar"></i>{{ 'nav.reports' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/orders/new')"><i class="pi pi-plus-circle"></i>{{ 'nav.createOrder' | t }}</button>
              } @else {
                <button class="btn btn-ghost qa-btn" (click)="go('/clients')"><i class="pi pi-users"></i>{{ 'nav.clients' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/orders/new')"><i class="pi pi-plus-circle"></i>{{ 'nav.createOrder' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/orders')"><i class="pi pi-file-edit"></i>{{ 'nav.orders' | t }}</button>
                <button class="btn btn-ghost qa-btn" (click)="go('/products')"><i class="pi pi-box"></i>{{ 'nav.catalog' | t }}</button>
              }
            </div>
          </div>

          <div class="card card-pad" style="flex:1">
            <div class="card-title" style="margin-bottom:12px">{{ 'dashboard.recentActivity' | t }}</div>
            @if (loading()) {
              <div class="skeleton" style="height:14px;margin-bottom:8px"></div>
              <div class="skeleton" style="height:14px;width:80%"></div>
            } @else if (activity().length === 0) {
              <div class="empty-state" style="padding:24px 8px">
                <div class="empty-state-icon"><i class="pi pi-clock"></i></div>
                <div class="empty-state-title">Sin actividad</div>
              </div>
            } @else {
              @for (a of activity(); track a.id) {
                <div class="activity-item">
                  <div class="activity-dot" [style.background]="activityColor(a.type)" aria-hidden="true"></div>
                  <span class="activity-text">{{ a.text }}</span>
                  <span class="activity-time">{{ a.time }}</span>
                </div>
              }
            }
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="banner banner-danger" style="margin-top: 16px;">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ error() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dash-two-col { display:grid; grid-template-columns:1fr 272px; gap:16px; align-items:start; }
    @media (max-width:1060px) { .dash-two-col { grid-template-columns:1fr; } }
    .kpi-icon-bubble { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
    .quick-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .qa-btn { flex-direction:column; padding:14px 8px; gap:6px; font-size:11px; height:auto; }
    .qa-btn .pi { font-size:20px; }
  `],
})
export class DashboardPage {
  private readonly api = inject(DashboardApi);
  private readonly session = inject(IamStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly alerts = signal<Alert[]>([]);
  readonly activity = signal<ActivityEntry[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly dispatches = signal<Dispatch[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly lots = signal<InventoryLot[]>([]);
  readonly alertsOpen = signal(true);

  readonly isLogistics = computed(() => {
    const r = this.session.roleKey();
    return r === 'logistics';
  });

  readonly firstName = computed(() => (this.user()?.name ?? '').split(' ')[0] || '');
  readonly todayLabel = computed(() => {
    const l = this.i18n.lang();
    return new Date().toLocaleDateString(l === 'es' ? 'es-PE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  readonly pendingOrders = computed(() =>
    this.orders().filter((o) => ['validating', 'blocked'].includes(o.status)),
  );
  readonly lowStockCount = computed(() =>
    this.products().filter((p) => p.status === 'low' || p.status === 'out' || (p.stock ?? 0) <= (p.minStock ?? 0)).length,
  );
  readonly expiringLotsCount = computed(() =>
    this.lots().filter((l) => this.daysUntil(l.expiry) <= 10).length,
  );
  readonly inTransitCount = computed(() => this.dispatches().filter((d) => d.status === 'in_transit').length);
  readonly pendingEvidenceCount = computed(() =>
    this.dispatches().filter((d) => d.evidenceRequired && !d.evidenceDone).length,
  );
  readonly activeClientsCount = computed(() => this.clients().filter((c) => c.status === 'active').length);
  readonly validatingCount = computed(() => this.orders().filter((o) => o.status === 'validating').length);
  readonly blockedCount = computed(() => this.orders().filter((o) => o.status === 'blocked').length);

  readonly filteredAlerts = computed(() => {
    if (this.isLogistics()) return this.alerts();
    return this.alerts().filter((a) => a.screen !== 'inventory' && a.screen !== 'dispatch');
  });

  constructor() {
    forkJoin({
      alerts: this.api.alerts(),
      activity: this.api.activity(),
      orders: this.api.orders(),
      products: this.api.products(),
      dispatches: this.api.dispatches(),
      clients: this.api.clients(),
      lots: this.api.lots(),
    }).subscribe({
      next: ({ alerts, activity, orders, products, dispatches, clients, lots }) => {
        this.alerts.set(alerts);
        this.activity.set(activity);
        this.orders.set(orders);
        this.products.set(products);
        this.dispatches.set(dispatches);
        this.clients.set(clients);
        this.lots.set(lots);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información operativa. Inicia Fake API con npm run dev:all.');
        this.loading.set(false);
      },
    });
  }

  go(path: string): void {
    void this.router.navigate([path]);
  }

  clientName(id: string): string {
    return this.clients().find((c) => c.id === id)?.name ?? id;
  }

  orderStatusLabel(s: string): string {
    return this.i18n.t('order.status.' + s) || s;
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

  iconForAlert(a: Alert): string {
    if (a.type === 'danger') return 'pi pi-times-circle';
    if (a.type === 'warning') return 'pi pi-exclamation-triangle';
    return 'pi pi-info-circle';
  }

  alertColor(a: Alert): string {
    if (a.type === 'danger') return '#B91C1C';
    if (a.type === 'warning') return '#B45309';
    return '#1D4ED8';
  }

  activityColor(type?: string): string {
    if (type === 'success' || type === 'ok') return '#22C55E';
    if (type === 'warning' || type === 'warn') return '#F59E0B';
    if (type === 'danger' || type === 'error') return '#EF4444';
    return '#2563EB';
  }

  handleAlert(a: Alert): void {
    const map: Record<string, string> = {
      inventory: '/inventory',
      dispatch: '/dispatches',
      orders: '/orders',
      clients: '/clients',
    };
    const dest = a.screen && map[a.screen];
    if (dest) this.go(dest);
  }

  private daysUntil(date?: string): number {
    if (!date) return 99999;
    const target = new Date(date).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  }
}
