import { Injectable, inject, signal } from '@angular/core';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';

@Injectable({ providedIn: 'root' })
export class ClientsStore {
  private readonly api = inject(ClientsApi);

  readonly loading = signal(false);
  readonly clients = signal<Client[]>([]);

  list() { return this.api.list(); }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
