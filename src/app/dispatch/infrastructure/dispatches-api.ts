import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Client } from '@app/clients/domain/model';
import { Dispatch } from '@app/dispatch/domain/model';
import { Order } from '@app/ordering/domain/model';

@Injectable({ providedIn: 'root' })
export class DispatchesApi {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Dispatch[]>('api/v1/dispatches'); }
  byId(id: string) {
    return this.list().pipe(map((dispatches) => {
      const dispatch = dispatches.find((item) => item.id === id);
      if (!dispatch) throw new Error(`Dispatch ${id} not found`);
      return dispatch;
    }));
  }
  clients() { return this.http.get<Client[]>('api/v1/clients'); }
  updateDispatch(id: string, payload: Partial<Dispatch>) { return this.http.patch<Dispatch>(`api/v1/dispatches/${id}`, payload); }
  updateOrderStatus(id: string, status: string) { return this.http.patch<Order>(`api/v1/orders/${id}`, { status }); }
}
