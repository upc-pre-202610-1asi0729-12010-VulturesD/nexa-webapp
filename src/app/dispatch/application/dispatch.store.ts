import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DispatchesApi } from '@app/dispatch/infrastructure/dispatches-api';
import { Dispatch, DispatchEvent, ProofOfDelivery, TemperatureLog } from '@app/dispatch/domain/model';

@Injectable({ providedIn: 'root' })
export class DispatchStore {
  private readonly api = inject(DispatchesApi);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly dispatches = signal<Dispatch[]>([]);

  list() { return this.api.list(); }
  byId(id: number) { return this.api.byId(id); }
  detail(id: number) { return this.api.detail(id); }
  clients() { return this.api.clients(); }
  assign(id: number, responsible: string) { return this.action(this.api.assign(id, responsible)); }
  schedule(id: number, eta: string, deliveryWindow: string, note = '') { return this.action(this.api.schedule(id, eta, deliveryWindow, note)); }
  startRoute(id: number) { return this.action(this.api.startRoute(id)); }
  complete(id: number) { return this.action(this.api.complete(id)); }
  incident(id: number, note: string) { return this.action(this.api.incident(id, note)); }
  reschedule(id: number, eta: string, deliveryWindow: string, note = '') { return this.action(this.api.reschedule(id, eta, deliveryWindow, note)); }
  changeStatus(id: number, status: string, note = '', visibleToBuyer = false) { return this.action(this.api.changeStatus(id, status, note, visibleToBuyer)); }
  createEvent(id: number, status: string, description: string, visibleToBuyer: boolean): Observable<DispatchEvent> { return this.record(this.api.createEvent(id, status, description, visibleToBuyer)); }
  createTemperature(id: number, celsius: number, zone: string, status: string): Observable<TemperatureLog> { return this.record(this.api.createTemperature(id, celsius, zone, status)); }
  completePod(id: number, receivedBy: string, photo: boolean, signature: boolean, notes: string): Observable<ProofOfDelivery> { return this.record(this.api.completePod(id, receivedBy, photo, signature, notes)); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (dispatches) => { this.dispatches.set(dispatches); this.loading.set(false); },
      error: () => { this.error.set('dispatch.errors.load'); this.loading.set(false); },
    });
  }

  private action(request: Observable<Dispatch>): Observable<Dispatch> {
    this.saving.set(true);
    this.error.set(null);
    return request.pipe(tap({
      next: (saved) => { this.dispatches.update((rows) => rows.map((row) => row.id === saved.id ? saved : row)); this.saving.set(false); },
      error: () => { this.error.set('dispatch.errors.action'); this.saving.set(false); },
    }));
  }

  private record<T>(request: Observable<T>): Observable<T> {
    this.saving.set(true);
    this.error.set(null);
    return request.pipe(tap({ next: () => this.saving.set(false), error: () => { this.error.set('dispatch.errors.action'); this.saving.set(false); } }));
  }
}
