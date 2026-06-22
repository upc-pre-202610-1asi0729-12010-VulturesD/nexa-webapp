import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { OrdersApi } from '@app/ordering/infrastructure/orders-api';

@Injectable({ providedIn: 'root' })
export class ShellStore {
  private readonly ordersApi = inject(OrdersApi);

  private readonly pendingOrdersSignal = toSignal(
    this.ordersApi.list().pipe(
      map((orders) => orders.filter((o) => ['validating', 'blocked'].includes(o.status)).length),
      catchError(() => of(0)),
    ),
    { initialValue: 0 },
  );

  readonly pendingOrders = computed(() => this.pendingOrdersSignal());
}
