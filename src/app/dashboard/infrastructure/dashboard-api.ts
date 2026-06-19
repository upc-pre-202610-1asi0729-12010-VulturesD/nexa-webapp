import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { Alert, ActivityEntry, BusinessDocument, CompanyUser, Promotion } from '@app/dashboard/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { Client } from '@app/clients/domain/model';
import { InventoryLot } from '@app/inventory/domain/model';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);

  alerts() { return this.getResource<Alert[]>('alerts'); }
  activity() { return this.getResource<ActivityEntry[]>('activity-log'); }
  orders() { return this.getResource<Order[]>('orders'); }
  products() { return this.getResource<Product[]>('products'); }
  dispatches() { return this.getResource<Dispatch[]>('dispatches'); }
  clients() { return this.getResource<Client[]>('clients'); }
  lots() { return this.getResource<InventoryLot[]>('inventory-lots'); }
  businessDocuments() { return this.getResource<BusinessDocument[]>('business-documents'); }
  users() { return this.getResource<CompanyUser[]>('users'); }
  promotions() { return this.getResource<Promotion[]>('promotions'); }

  private getResource<T>(resource: string) {
    return this.http.get<T>(`api/v1/${resource}`);
  }
}
