import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { BusinessDocument, InvoicingOrder, OrderDocumentCard } from '@app/invoicing/domain/model';
import { CreateBusinessDocument, InvoicingApi } from '@app/invoicing/infrastructure/invoicing-api';

export const REQUIRED_DOCUMENT_TYPES = ['factura_xml', 'factura_pdf', 'guia_pdf'] as const;

@Injectable({ providedIn: 'root' })
export class BusinessDocumentsStore {
  private readonly api = inject(InvoicingApi);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly documents = signal<BusinessDocument[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly orders = signal<InvoicingOrder[]>([]);
  readonly statusFilter = signal('all');
  readonly typeFilter = signal('all');
  readonly clientFilter = signal('all');

  readonly pendingCount = computed(() => this.documents().filter((item) => item.status === 'pending').length);
  readonly reviewCount = computed(() => this.documents().filter((item) => ['uploaded', 'ready'].includes(item.status)).length);
  readonly linkedCount = computed(() => this.documents().filter((item) => item.orderId !== null).length);
  readonly missingCount = computed(() => this.orderCards().reduce((total, card) => total + card.missingCount, 0));
  readonly orderCards = computed<OrderDocumentCard[]>(() => this.filteredOrders().map((order) => {
    const documents = this.documents().filter((item) => item.orderId === order.backendId);
    const required = REQUIRED_DOCUMENT_TYPES.map((type) => {
      const document = documents.find((item) => item.type === type) ?? null;
      return { type, document, status: document?.status ?? 'missing' };
    });
    return {
      order,
      documents,
      required,
      readyCount: required.filter((item) => ['uploaded', 'ready', 'accepted'].includes(item.status)).length,
      missingCount: required.filter((item) => ['missing', 'pending'].includes(item.status)).length,
    };
  }));

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ documents: this.api.documents(), clients: this.api.clients(), orders: this.api.orders() }).subscribe({
      next: ({ documents, clients, orders }) => {
        this.documents.set(documents);
        this.clients.set(clients);
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => { this.error.set('businessDocuments.errors.load'); this.loading.set(false); },
    });
  }

  create(resource: CreateBusinessDocument): Observable<BusinessDocument> { return this.action(this.api.createDocument(resource)); }
  generate(orderId: number, type: string): Observable<BusinessDocument> { return this.action(this.api.generateDocument(orderId, type)); }
  changeStatus(id: number, status: string, visibleToBuyer?: boolean): Observable<BusinessDocument> {
    return this.action(this.api.changeDocumentStatus(id, status, visibleToBuyer));
  }
  download(id: number) { return this.api.downloadDocument(id); }

  orderById(orderId: number): InvoicingOrder | null { return this.orders().find((order) => order.backendId === orderId) ?? null; }
  documentsForOrder(orderId: number): BusinessDocument[] { return this.documents().filter((document) => document.orderId === orderId); }
  clientName(clientAccountId: number | null): string {
    if (clientAccountId === null) return '-';
    return this.clients().find((client) => Number(client.id.replace(/\D/g, '')) === clientAccountId)?.name ?? `#${clientAccountId}`;
  }

  private filteredOrders(): InvoicingOrder[] {
    return this.orders().filter((order) => {
      if (this.clientFilter() !== 'all' && String(order.customerId) !== this.clientFilter()) return false;
      const documents = this.documents().filter((item) => item.orderId === order.backendId);
      if (this.typeFilter() !== 'all' && !documents.some((item) => item.type === this.typeFilter())) return false;
      if (this.statusFilter() === 'missing') {
        const available = new Set(documents.filter((item) => !['missing', 'pending'].includes(item.status)).map((item) => item.type));
        if (REQUIRED_DOCUMENT_TYPES.every((type) => available.has(type))) return false;
      } else if (this.statusFilter() !== 'all' && !documents.some((item) => item.status === this.statusFilter())) return false;
      return true;
    });
  }

  private action(request: Observable<BusinessDocument>): Observable<BusinessDocument> {
    this.saving.set(true);
    this.error.set(null);
    return request.pipe(tap({
      next: (saved) => {
        this.documents.update((items) => {
          const existing = items.some((item) => item.id === saved.id);
          return existing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved];
        });
        this.saving.set(false);
      },
      error: () => { this.error.set('businessDocuments.errors.action'); this.saving.set(false); },
    }));
  }
}
