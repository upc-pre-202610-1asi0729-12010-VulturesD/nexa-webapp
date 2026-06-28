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
  timeline(id: string | number) { return this.api.timeline(id); }
  confirm(id: string | number, paymentConfirmation: string, inventoryReservation: string) { return this.api.confirm(id, paymentConfirmation, inventoryReservation); }
  reject(id: string | number, rejectionReason: string) { return this.api.reject(id, rejectionReason); }
  cancel(id: string | number) { return this.api.cancel(id); }
}
