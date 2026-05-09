import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';

@Injectable({ providedIn: 'root' })
export class PortalStore {
  private readonly http = inject(HttpClient);

  load(clientId: string): Observable<PortalSnapshot> {
    return forkJoin({
      orders: this.http.get<Order[]>('api/v1/orders'),
      products: this.http.get<Product[]>('api/v1/products'),
      clients: this.http.get<Client[]>('api/v1/clients'),
    }).pipe(
      map(({ orders, products, clients }): PortalSnapshot => ({
        myOrders: orders.filter((o) => o.clientId === clientId),
        products,
        client: clients.find((c) => c.id === clientId) ?? null,
      })),
    );
  }
}
