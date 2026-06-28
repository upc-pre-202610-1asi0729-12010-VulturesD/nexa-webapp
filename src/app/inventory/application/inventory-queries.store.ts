import { Injectable, inject } from '@angular/core';
import { InventoryApi } from '@app/inventory/infrastructure/inventory-api';

@Injectable({ providedIn: 'root' })
export class InventoryQueriesStore {
  private readonly api = inject(InventoryApi);

  products() { return this.api.products(); }
  warehouses() { return this.api.warehouses(); }
  lots() { return this.api.lots(); }
  movements() { return this.api.movements(); }
  createMovement(resource: import('@app/inventory/domain/model').CreateStockMovement) { return this.api.createMovement(resource); }
}
