import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '@app/shared/presentation/components/page-header.component';
import { StatusBadgeComponent } from '@app/shared/presentation/components/status-badge.component';
import { InventoryApi } from '../../infrastructure/inventory-api';
import { InventoryLot } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';

@Component({
  selector: 'nx-lots',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div class="page">
      <nx-page-header title="Lotes de inventario" subtitle="Trazabilidad y vencimientos"></nx-page-header>

      <div class="card">
        @if (loading()) {
          <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
        } @else if (lots().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-tags"></i></div>
            <div class="empty-state-title">Sin lotes registrados</div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr><th>Lote</th><th>Producto</th><th>Cant.</th><th>Reservado</th><th>Almacén</th><th>Zona</th><th>Ingreso</th><th>Vence</th><th>Estado</th></tr>
            </thead>
            <tbody>
              @for (l of lots(); track l.id) {
                <tr>
                  <td><span class="text-mono"><strong>{{ l.id }}</strong></span></td>
                  <td>{{ productName(l.productId) }}</td>
                  <td>{{ l.qty }}</td>
                  <td>{{ l.reserved ?? 0 }}</td>
                  <td>{{ l.warehouse }}</td>
                  <td><span class="badge-temp">{{ l.zone }}</span></td>
                  <td>{{ l.entryDate }}</td>
                  <td>{{ l.expiry }}</td>
                  <td><nx-status [status]="l.status || ''" [label]="l.status || ''"></nx-status></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class LotsPage {
  private readonly api = inject(InventoryApi);
  readonly loading = signal(true);
  readonly lots = signal<InventoryLot[]>([]);
  readonly products = signal<Product[]>([]);

  productName(id: string): string {
    return this.products().find((p) => p.id === id)?.name ?? id;
  }

  constructor() {
    forkJoin({ lots: this.api.lots(), products: this.api.products() }).subscribe({
      next: ({ lots, products }) => {
        this.lots.set(lots);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
