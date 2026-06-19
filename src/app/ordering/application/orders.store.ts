import { Injectable, inject } from '@angular/core';
import { OrdersApi } from '@app/ordering/infrastructure/orders-api';
import { Order } from '@app/ordering/domain/model';

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly api = inject(OrdersApi);

  list() { return this.api.list(); }
  byId(id: string) { return this.api.byId(id); }
  clients() { return this.api.clients(); }
  products() { return this.api.products(); }
  create(order: Order) { return this.api.create(order); }
}
