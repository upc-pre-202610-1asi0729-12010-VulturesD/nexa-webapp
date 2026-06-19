import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Client } from '@app/clients/domain/model';
import { BusinessDocument } from '@app/dashboard/domain/model';
import { DashboardApi } from '@app/dashboard/infrastructure/dashboard-api';
import { Order } from '@app/ordering/domain/model';

@Injectable({ providedIn: 'root' })
export class BusinessDocumentsStore {
  private readonly api = inject(DashboardApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly documents = signal<BusinessDocument[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly statusFilter = signal<string>('all');

  readonly filteredDocuments = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'all') return this.documents();
    return this.documents().filter(doc => doc.status === filter);
  });

  readonly pendingCount = computed(() => this.documents().filter(d => d.status === 'pending').length);
  readonly acceptedCount = computed(() => this.documents().filter(d => d.status === 'accepted').length);
  readonly totalAmount = computed(() => this.documents().reduce((sum, d) => sum + (d.amount || 0), 0));

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      documents: this.api.businessDocuments().pipe(catchError(() => of([] as BusinessDocument[]))),
      clients: this.api.clients().pipe(catchError(() => of([] as Client[]))),
      orders: this.api.orders().pipe(catchError(() => of([] as Order[]))),
    }).subscribe({
      next: ({ documents, clients, orders }) => {
        this.documents.set(documents);
        this.clients.set(clients);
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load business documents from the backend.');
        this.loading.set(false);
      },
    });
  }

  clientName(clientId: string): string {
    return this.clients().find(c => c.id === clientId)?.name ?? clientId;
  }
}
