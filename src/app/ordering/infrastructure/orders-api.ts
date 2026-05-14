import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);

  list() { return this.http.get<Order[]>('api/v1/orders'); }
  byId(id: string) {
    return this.list().pipe(map((orders) => {
      const order = orders.find((item) => item.id === id);
      if (!order) throw new Error(`Order ${id} not found`);
      return order;
    }));
  }
  clients() { return this.http.get<Client[]>('api/v1/clients'); }
  products() { return this.http.get<Product[]>('api/v1/products'); }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>('api/v1/orders', order);
  }
}
