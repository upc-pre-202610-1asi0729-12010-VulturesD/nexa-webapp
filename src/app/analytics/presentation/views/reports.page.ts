import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@app/shared/presentation/components/page-header.component';
import { StatusBadgeComponent } from '@app/shared/presentation/components/status-badge.component';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';
import { IamStore } from '@app/iam/application/iam.store';
import { AnalyticsStore } from '../../application/analytics.store';
import { CommercialReport, OperationsReport } from '@app/analytics/domain/model';

@Component({
  selector: 'nx-reports',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusBadgeComponent, TranslatePipe],
  template: `
    <div class="page">
      <nx-page-header [title]="'reports.title' | t" [subtitle]="'reports.subtitle' | t">
        <button class="btn btn-ghost" disabled title="Export available in next iteration">
          <i class="pi pi-download"></i> Exportar (simulado)
        </button>
      </nx-page-header>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else {

        @if (commercial(); as c) {
          <div class="section-label">Reporte comercial</div>
          <div class="grid-3" style="margin-bottom: 20px;">
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-shopping-cart"></i> Órdenes</div>
              <div class="kpi-value">{{ totalOrders(c) }}</div>
              <div class="kpi-sub">{{ c.blocked.length }} bloqueadas / canceladas</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-dollar"></i> Ingresos simulados</div>
              <div class="kpi-value">S/ {{ c.totalRevenue | number:'1.0-0' }}</div>
              <div class="kpi-sub">acumulado</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-exclamation-triangle"></i> Prioridad alta</div>
              <div class="kpi-value">{{ highPriority(c) }}</div>
              <div class="kpi-sub">órdenes urgentes</div>
            </div>
          </div>

          <div class="grid-2" style="margin-bottom: 24px;">
            <div class="card">
              <div class="card-header"><div class="card-title">Órdenes por estado</div></div>
              <table class="data-table">
                <thead><tr><th>Estado</th><th>Cantidad</th></tr></thead>
                <tbody>
                  @for (row of c.byStatus; track row.status) {
                    <tr><td><nx-status [status]="row.status" [label]="row.status"></nx-status></td><td><strong>{{ row.count }}</strong></td></tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="card">
              <div class="card-header"><div class="card-title">Órdenes bloqueadas</div></div>
              @if (c.blocked.length === 0) {
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="pi pi-check-circle"></i></div>
                  <div class="empty-state-title">Sin órdenes bloqueadas</div>
                </div>
              } @else {
                <table class="data-table">
                  <thead><tr><th>Orden</th><th>Cliente</th><th>Estado</th></tr></thead>
                  <tbody>
                    @for (o of c.blocked; track o.id) {
                      <tr>
                        <td><span class="text-mono">{{ o.id }}</span></td>
                        <td>{{ o.clientId }}</td>
                        <td><nx-status [status]="o.status" [label]="o.status"></nx-status></td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        }

        @if (operations(); as op) {
          <div class="section-label">Reporte operativo</div>
          <div class="grid-3" style="margin-bottom: 20px;">
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-box"></i> Stock bajo</div>
              <div class="kpi-value">{{ op.lowStock.length }}</div>
              <div class="kpi-sub">productos bajo mínimo</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-clock"></i> Lotes por vencer</div>
              <div class="kpi-value">{{ op.nearExpiry.length }}</div>
              <div class="kpi-sub">próximos 30 días</div>
            </div>
            <div class="card kpi-card">
              <div class="kpi-label"><i class="pi pi-truck"></i> Despachos activos</div>
              <div class="kpi-value">{{ op.activeDispatches.length }}</div>
              <div class="kpi-sub">no entregados</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-header"><div class="card-title">Productos con stock bajo</div></div>
              @if (op.lowStock.length === 0) {
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="pi pi-check-circle"></i></div>
                  <div class="empty-state-title">Sin productos en alerta</div>
                </div>
              } @else {
                <table class="data-table">
                  <thead><tr><th>SKU</th><th>Producto</th><th>Stock</th><th>Mín</th></tr></thead>
                  <tbody>
                    @for (p of op.lowStock; track p.id) {
                      <tr>
                        <td><span class="text-mono">{{ p.sku }}</span></td>
                        <td>{{ p.name }}</td>
                        <td><strong>{{ p.stock }}</strong></td>
                        <td>{{ p.minStock ?? 0 }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
            <div class="card">
              <div class="card-header"><div class="card-title">Lotes por vencer (30d)</div></div>
              @if (op.nearExpiry.length === 0) {
                <div class="empty-state">
                  <div class="empty-state-icon"><i class="pi pi-check-circle"></i></div>
                  <div class="empty-state-title">Sin lotes por vencer</div>
                </div>
              } @else {
                <table class="data-table">
                  <thead><tr><th>Lote</th><th>Producto</th><th>Cant</th><th>Vence</th></tr></thead>
                  <tbody>
                    @for (l of op.nearExpiry; track l.id) {
                      <tr>
                        <td><span class="text-mono">{{ l.id }}</span></td>
                        <td><span class="text-mono">{{ l.productId }}</span></td>
                        <td>{{ l.qty }}</td>
                        <td><span class="badge badge-amber">{{ l.expiry }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ReportsPage {
  private readonly store = inject(AnalyticsStore);
  private readonly session = inject(IamStore);

  readonly loading = signal(true);
  readonly commercial = signal<CommercialReport | null>(null);
  readonly operations = signal<OperationsReport | null>(null);

  totalOrders(c: CommercialReport): number {
    return c.byStatus.reduce((a, r) => a + r.count, 0);
  }
  highPriority(c: CommercialReport): number {
    return c.byPriority.find((p) => p.priority === 'high')?.count ?? 0;
  }

  constructor() {
    const role = this.session.roleKey();
    const showCommercial = role === 'commercial';
    const showOps = role === 'logistics';

    const tasks: Promise<void>[] = [];
    if (showCommercial || (!showOps && role !== 'buyer')) {
      tasks.push(new Promise((resolve) => {
        this.store.commercial().subscribe({
          next: (c) => { this.commercial.set(c); resolve(); },
          error: () => resolve(),
        });
      }));
    }
    if (showOps || (!showCommercial && role !== 'buyer')) {
      tasks.push(new Promise((resolve) => {
        this.store.operations().subscribe({
          next: (o) => { this.operations.set(o); resolve(); },
          error: () => resolve(),
        });
      }));
    }
    Promise.all(tasks).then(() => this.loading.set(false));
  }
}
