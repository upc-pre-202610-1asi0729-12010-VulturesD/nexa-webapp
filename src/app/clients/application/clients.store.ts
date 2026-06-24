import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { Client, ClientFinancialProfile, ClientUpsert } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { InvoicingApi } from '@app/invoicing/infrastructure/invoicing-api';
import { BusinessDocument, InvoicingOrder } from '@app/invoicing/domain/model';

export interface ClientProfileSnapshot {
  client: Client;
  financial: ClientFinancialProfile;
  orders: InvoicingOrder[];
  documents: BusinessDocument[];
}

@Injectable({ providedIn: 'root' })
export class ClientsStore {
  private readonly api = inject(ClientsApi);
  private readonly invoicing = inject(InvoicingApi);

  readonly loading = signal(false);
  readonly clients = signal<Client[]>([]);

  list() { return this.api.list(); }
  create(resource: ClientUpsert) { return this.api.create(resource); }
  update(id: string | number, resource: ClientUpsert) { return this.api.update(id, resource); }

  profile(id: string | number) {
    return forkJoin({
      client: this.api.get(id),
      financial: this.api.financialProfile(id),
      orders: this.invoicing.orders(),
      documents: this.invoicing.documents(),
    }).pipe(map(({ client, financial, orders, documents }): ClientProfileSnapshot => ({
      client,
      financial,
      orders: orders.filter((order) => order.customerId === client.backendId || order.clientId === client.id),
      documents: documents.filter((document) => client.backendId != null && document.clientAccountId === client.backendId),
    })));
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (clients) => { this.clients.set(clients); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
