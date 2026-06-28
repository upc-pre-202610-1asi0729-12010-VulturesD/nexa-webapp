import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { InventoryLot, StockMovement, Warehouse } from '@app/inventory/domain/model';
import { InventoryApi } from '@app/inventory/infrastructure/inventory-api';

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private readonly api = inject(InventoryApi);

  readonly loading = signal(false);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly lots = signal<InventoryLot[]>([]);
  readonly movements = signal<StockMovement[]>([]);

  load(): void {
    this.loading.set(true);
    forkJoin({
      warehouses: this.api.warehouses(),
      lots: this.api.lots(),
      movements: this.api.movements(),
    }).subscribe({
      next: ({ warehouses, lots, movements }) => {
        this.warehouses.set(warehouses);
        this.lots.set(lots);
        this.movements.set(movements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
