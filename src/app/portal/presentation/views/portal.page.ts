import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@app/shared/presentation/components/page-header.component';
import { StatusBadgeComponent } from '@app/shared/presentation/components/status-badge.component';
import { TranslatePipe } from '@app/shared/infrastructure/pipes/t.pipe';
import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { IamStore } from '@app/iam/application/iam.store';
import { PortalStore } from '../../application/portal.store';

@Component({
  selector: 'nx-portal',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusBadgeComponent, TranslatePipe],
  template: `
    <div class="page">
      <nx-page-header
        [title]="'portal.title' | t"
        [subtitle]="(client()?.name || '') + ' · ' + ('portal.subtitle' | t)">
      </nx-page-header>

      @if (loading()) {
        <div class="card card-pad"><div class="skeleton" style="height:14px"></div></div>
      } @else if (!user()?.clientId) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-lock"></i></div>
            <div class="empty-state-title">Sin cliente asignado</div>
            <div class="empty-state-desc">Tu cuenta de comprador no está vinculada a un cliente B2B.</div>
          </div>
        </div>
      } @else {
        <div class="grid-3" style="margin-bottom: 20px;">
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-shopping-cart"></i> Pedidos activos</div>
            <div class="kpi-value">{{ activeOrders() }}</div>
            <div class="kpi-sub">de {{ myOrders().length }} totales</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-credit-card"></i> Crédito usado</div>
            <div class="kpi-value">S/ {{ client()?.creditUsed || 0 | number:'1.0-0' }}</div>
            <div class="kpi-sub">de S/ {{ client()?.creditLimit || 0 | number:'1.0-0' }}</div>
          </div>
          <div class="card kpi-card">
            <div class="kpi-label"><i class="pi pi-box"></i> Catálogo</div>
            <div class="kpi-value">{{ products().length }}</div>
            <div class="kpi-sub">productos disponibles</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <div class="card-title">{{ 'portal.myOrders' | t }}</div>
            <span class="text-mono">{{ myOrders().length }} pedidos</span>
          </div>
          @if (myOrders().length === 0) {
            <div class="empty-state">
              <div class="empty-state-icon"><i class="pi pi-shopping-cart"></i></div>
              <div class="empty-state-title">Aún sin pedidos</div>
              <div class="empty-state-desc">Cuando tu cliente registre un pedido aparecerá aquí.</div>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr><th>Orden</th><th>Fecha</th><th>Items</th><th>Total</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                @for (o of myOrders(); track o.id) {
                  <tr>
                    <td><span class="text-mono"><strong>{{ o.id }}</strong></span></td>
                    <td>{{ o.date }}</td>
                    <td>{{ o.items.length }}</td>
                    <td><strong>S/ {{ o.total | number:'1.2-2' }}</strong></td>
                    <td><nx-status [status]="o.status" [label]="o.status"></nx-status></td>
                    <td><a [routerLink]="['/orders', o.id]" class="link">Ver →</a></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">{{ 'portal.catalog' | t }}</div>
            <a routerLink="/products" class="link">Ver completo →</a>
          </div>
          <table class="data-table">
            <thead><tr><th>SKU</th><th>Producto</th><th>Temp.</th><th>Precio</th><th>Disponibilidad</th></tr></thead>
            <tbody>
              @for (p of catalogPreview(); track p.id) {
                <tr>
                  <td><span class="text-mono">{{ p.sku }}</span></td>
                  <td>{{ p.name }}</td>
                  <td>@if (p.temp) { <span class="badge-temp">{{ p.temp }}</span> } @else { — }</td>
                  <td><strong>S/ {{ p.price | number:'1.2-2' }}</strong></td>
                  <td>
                    @if (p.stock - (p.reserved ?? 0) > 0) {
                      <span class="badge badge-green">disponible</span>
                    } @else {
                      <span class="badge badge-amber">consultar</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class PortalPage {
  private readonly store = inject(PortalStore);
  private readonly session = inject(IamStore);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly client = signal<Client | null>(null);
  readonly myOrders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);

  activeOrders(): number {
    return this.myOrders().filter((o) => !/delivered|completed|cancel/i.test(o.status)).length;
  }
  catalogPreview(): Product[] {
    return this.products().slice(0, 6);
  }

  constructor() {
    const u = this.user();
    if (!u?.clientId) { this.loading.set(false); return; }
    this.store.load(u.clientId).subscribe({
      next: ({ myOrders, products, client }) => {
        this.myOrders.set(myOrders);
        this.products.set(products);
        this.client.set(client);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
