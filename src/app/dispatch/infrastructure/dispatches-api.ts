import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { Dispatch } from '@app/dispatch/domain/model';
import { Order } from '@app/ordering/domain/model';

@Injectable({ providedIn: 'root' })
export class DispatchesApi {
  private readonly http = inject(HttpClient);
  private readonly clientsApi = inject(ClientsApi);
  list() { return this.http.get<Dispatch[]>('api/v1/dispatches'); }

  byId(id: string) {
    return this.http.get<Dispatch>(`api/v1/dispatches/${id}`).pipe(
      catchError(() => this.list().pipe(map((items) => items.find((item) => item.id === id) as Dispatch))),
    );
  }

  clients() { return this.clientsApi.list(); }
  updateDispatch(id: string, payload: Partial<Dispatch>) { return this.http.patch<Dispatch>(`api/v1/dispatches/${id}`, payload).pipe(catchError(() => of({ id, ...payload } as Dispatch))); }
  updateOrderStatus(id: string, status: string) { return this.http.patch<Order>(`api/v1/orders/${id}`, { status }).pipe(catchError(() => of({ id, status } as Order))); }
}
