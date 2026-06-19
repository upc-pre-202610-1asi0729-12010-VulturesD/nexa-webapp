import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { PurchaseRequest } from '@app/ordering/application/purchase-requests.store';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly clientsApi = inject(ClientsApi);

  list() { return this.http.get<Order[]>('api/v1/orders'); }

  byId(id: string) {
    return this.http.get<Order>(`api/v1/orders/${id}`).pipe(
      catchError(() => this.list().pipe(map((orders) => orders.find((order) => order.id === id) as Order))),
    );
  }

  clients() { return this.clientsApi.list(); }
  products() { return this.http.get<Product[]>('api/v1/products'); }
  purchaseRequests() { return this.http.get<PurchaseRequest[]>('api/v1/purchase-requests'); }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>('api/v1/orders', order).pipe(catchError(() => of(order)));
  }
}
