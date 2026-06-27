import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateStockMovement, InventoryLot, StockMovement, Warehouse } from '@app/inventory/domain/model';
import { ProductsApi } from '@app/catalog/infrastructure/products-api';

@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private readonly http = inject(HttpClient);
  private readonly productsApi = inject(ProductsApi);
  warehouses() { return this.http.get<Warehouse[]>('api/v1/warehouses'); }
  lots() { return this.http.get<InventoryLot[]>('api/v1/inventory-lots'); }
  movements() { return this.http.get<StockMovement[]>('api/v1/stock-movements'); }
  createMovement(resource: CreateStockMovement) { return this.http.post<StockMovement>('api/v1/stock-movements', resource); }
  products() { return this.productsApi.list(); }
}
