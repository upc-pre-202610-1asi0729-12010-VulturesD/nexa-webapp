import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '@app/shared/presentation/components/page-header.component';
import { InventoryApi } from '../../infrastructure/inventory-api';
import { StockMovement } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';

@Component({
  selector: 'nx-stock-movements',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="page">
      <nx-page-header title="Movimientos de stock" subtitle="Entradas, salidas y ajustes"></nx-page-header>

      <div class="card">
        @if (loading()) {
          <div class="card-pad"><div class="skeleton" style="height:14px"></div></div>
        } @else if (movements().length === 0) {
          <div class="empty-state">
            <div class="empty-state-icon"><i class="pi pi-sync"></i></div>
            <div class="empty-state-title">Sin movimientos</div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Lote</th><th>Cant.</th><th>Orden</th><th>Usuario</th><th>Nota</th></tr>
            </thead>
            <tbody>
              @for (m of movements(); track m.id) {
                <tr>
                  <td>{{ m.date }}</td>
                  <td><span class="badge" [class]="typeClass(m.type)">{{ m.type }}</span></td>
                  <td>{{ productName(m.productId || '') }}</td>
                  <td><span class="text-mono">{{ m.lotId }}</span></td>
                  <td><strong>{{ m.qty }}</strong></td>
                  <td><span class="text-mono">{{ m.orderId || '—' }}</span></td>
                  <td>{{ m.user }}</td>
                  <td class="muted">{{ m.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class StockMovementsPage {
  private readonly api = inject(InventoryApi);
  readonly loading = signal(true);
  readonly movements = signal<StockMovement[]>([]);
  readonly products = signal<Product[]>([]);

  productName(id: string): string {
    return this.products().find((p) => p.id === id)?.name ?? id;
  }

  typeClass(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('in') || t === 'entry' || t === 'entrada') return 'badge-green';
    if (t.includes('out') || t === 'salida') return 'badge-blue';
    if (t.includes('adjust') || t === 'ajuste') return 'badge-amber';
    return 'badge-gray';
  }

  constructor() {
    forkJoin({ movements: this.api.movements(), products: this.api.products() }).subscribe({
      next: ({ movements, products }) => {
        this.movements.set(movements);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
