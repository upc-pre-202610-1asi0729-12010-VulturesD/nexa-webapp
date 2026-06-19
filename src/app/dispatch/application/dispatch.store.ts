import { Injectable, inject, signal } from '@angular/core';
import { DispatchesApi } from '@app/dispatch/infrastructure/dispatches-api';
import { Dispatch } from '@app/dispatch/domain/model';

@Injectable({ providedIn: 'root' })
export class DispatchStore {
  private readonly api = inject(DispatchesApi);

  readonly loading = signal(false);
  readonly dispatches = signal<Dispatch[]>([]);

  list() { return this.api.list(); }
  byId(id: string) { return this.api.byId(id); }
  clients() { return this.api.clients(); }
  updateDispatch(id: string, payload: Partial<Dispatch>) { return this.api.updateDispatch(id, payload); }
  updateOrderStatus(id: string, status: string) { return this.api.updateOrderStatus(id, status); }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (dispatches) => {
        this.dispatches.set(dispatches);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
