import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Client } from '@app/clients/domain/model';
import { OrdersApi } from '@app/ordering/infrastructure/orders-api';

export interface PurchaseRequestItem {
  productId: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface PurchaseRequest {
  id: string;
  databaseId?: number;
  tenantId?: number;
  clientAccountId?: number;
  code?: string;
  clientId: string;
  origin?: string;
  status: string;
  priority: string;
  requestedDeliveryDate: string;
  deliveryAddressId: string;
  deliveryAddress?: string;
  deliveryDistrict?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  deliveryReference?: string;
  paymentOption?: string;
  shippingEstimate?: number;
  documentProfile: string;
  comments: string;
  commercialOwner?: string;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseRequestItem[];
  lineCount?: number;
}

@Injectable({ providedIn: 'root' })
export class PurchaseRequestsStore {
  private readonly api = inject(OrdersApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly requests = signal<PurchaseRequest[]>([]);
  readonly clients = signal<Client[]>([]);

  readonly sortedRequests = computed(() => {
    return [...this.requests()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      requests: this.api.purchaseRequestInbox().pipe(
        catchError(() => this.api.purchaseRequests()),
        catchError(() => of([] as PurchaseRequest[])),
      ),
      clients: this.api.clients().pipe(catchError(() => of([] as Client[]))),
    }).subscribe({
      next: ({ requests, clients }) => {
        this.requests.set(requests);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load purchase requests from backend.');
        this.loading.set(false);
      },
    });
  }

  clientName(clientId: string): string {
    return this.clients().find(c => c.id === clientId)?.name ?? clientId;
  }
}
