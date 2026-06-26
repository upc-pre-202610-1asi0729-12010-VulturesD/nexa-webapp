import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { Dispatch, DispatchDetail, DispatchEvent, ProofOfDelivery, TemperatureLog } from '@app/dispatch/domain/model';

@Injectable({ providedIn: 'root' })
export class DispatchesApi {
  private readonly http = inject(HttpClient);
  private readonly clientsApi = inject(ClientsApi);

  list(): Observable<Dispatch[]> {
    return this.http.get<Dispatch[]>('api/v1/dispatch-orders');
  }

  byId(id: number): Observable<Dispatch> {
    return this.http.get<Dispatch>(`api/v1/dispatch-orders/${id}`);
  }

  detail(id: number): Observable<DispatchDetail> {
    return forkJoin({
      dispatch: this.byId(id),
      events: this.http.get<DispatchEvent[]>(`api/v1/dispatch-orders/${id}/events`),
      proofs: this.http.get<ProofOfDelivery[]>(`api/v1/dispatch-orders/${id}/proofs-of-delivery`),
      temperatures: this.http.get<TemperatureLog[]>(`api/v1/dispatch-orders/${id}/temperature-logs`),
    });
  }

  clients(): Observable<Client[]> { return this.clientsApi.list(); }
  assign(id: number, responsible: string): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/assignees`, { responsible }); }
  schedule(id: number, eta: string, deliveryWindow: string, note = ''): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/schedules`, { eta, deliveryWindow, note }); }
  startRoute(id: number): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/route-starts`, {}); }
  complete(id: number): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/deliveries`, {}); }
  incident(id: number, note: string): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/incidents`, { note }); }
  reschedule(id: number, eta: string, deliveryWindow: string, note = ''): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/reschedules`, { eta, deliveryWindow, note }); }
  changeStatus(id: number, status: string, note = '', visibleToBuyer = false): Observable<Dispatch> { return this.http.post<Dispatch>(`api/v1/dispatch-orders/${id}/status-changes`, { status, note, visibleToBuyer }); }
  createEvent(id: number, status: string, description: string, visibleToBuyer: boolean): Observable<DispatchEvent> {
    return this.http.post<DispatchEvent>(`api/v1/dispatch-orders/${id}/events`, { status, description, visibleToBuyer });
  }
  createTemperature(id: number, celsius: number, zone: string, status: string): Observable<TemperatureLog> {
    return this.http.post<TemperatureLog>(`api/v1/dispatch-orders/${id}/temperature-logs`, { celsius, zone, status, recordedAt: new Date().toISOString() });
  }
  completePod(id: number, receivedBy: string, photoReference: boolean, signatureReference: boolean, notes: string): Observable<ProofOfDelivery> {
    return this.http.post<ProofOfDelivery>(`api/v1/dispatch-orders/${id}/proofs-of-delivery`, {
      receivedBy,
      completedAt: new Date().toISOString(),
      photoReference,
      signatureReference,
      notes,
    });
  }
}
