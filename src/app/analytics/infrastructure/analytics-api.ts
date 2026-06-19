import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dispatch } from '@app/dispatch/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private readonly http = inject(HttpClient);

  orders() { return this.http.get<Order[]>('api/v1/orders'); }
  products() { return this.http.get<Product[]>('api/v1/products'); }
  lots() { return this.http.get<InventoryLot[]>('api/v1/inventory-lots'); }
  dispatches() { return this.http.get<Dispatch[]>('api/v1/dispatches'); }
}
