import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alert, ActivityEntry } from '@app/dashboard/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);
  alerts() { return this.http.get<Alert[]>('api/v1/alerts'); }
  activity() { return this.http.get<ActivityEntry[]>('api/v1/activity-log'); }
  orders() { return this.http.get<Order[]>('api/v1/orders'); }
  products() { return this.http.get<Product[]>('api/v1/products'); }
  dispatches() { return this.http.get<Dispatch[]>('api/v1/dispatches'); }
  clients() { return this.http.get<Client[]>('api/v1/clients'); }
  lots() { return this.http.get<InventoryLot[]>('api/v1/inventory-lots'); }
}
