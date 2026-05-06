import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryLot, StockMovement, Warehouse } from '@app/inventory/domain/model';
import { Product } from '@app/catalog/domain/model';

@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private readonly http = inject(HttpClient);
  warehouses() { return this.http.get<Warehouse[]>('api/v1/warehouses'); }
  lots() { return this.http.get<InventoryLot[]>('api/v1/inventory-lots'); }
  movements() { return this.http.get<StockMovement[]>('api/v1/stock-movements'); }
  products() { return this.http.get<Product[]>('api/v1/products'); }
}
