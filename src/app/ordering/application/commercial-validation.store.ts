import { Injectable, inject, signal } from '@angular/core';
import { Observable, concatMap, forkJoin, of, tap, throwError } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { PurchaseRequest } from '@app/ordering/application/purchase-requests.store';
import { ConversationMessage, OrderAcceptance, OrdersApi } from '@app/ordering/infrastructure/orders-api';

export type CommercialActionResult = OrderAcceptance | PurchaseRequest;

@Injectable({ providedIn: 'root' })
export class CommercialValidationStore {
  private readonly api = inject(OrdersApi);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly request = signal<PurchaseRequest | null>(null);
  readonly client = signal<Client | null>(null);
  readonly messages = signal<ConversationMessage[]>([]);
  readonly loadError = signal(false);

  load(id: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.purchaseRequestById(id).pipe(
      concatMap((request) => forkJoin({
        request: of(request),
        clients: this.api.clients(),
        messages: request.databaseId
          ? this.api.purchaseRequestMessages(request.databaseId)
          : of([] as ConversationMessage[]),
      })),
    ).subscribe({
      next: ({ request, clients, messages }) => {
        this.request.set(request);
        this.client.set(clients.find((client) => client.id === request.clientId) ?? null);
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: () => {
        this.request.set(null);
        this.client.set(null);
        this.messages.set([]);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  accept(note: string, senderName: string): Observable<OrderAcceptance> {
    const request = this.request();
    if (!request) return throwError(() => new Error('Purchase request is not loaded.'));
    const validation = request.status === 'commercially_validated'
      ? of(request)
      : this.api.validatePurchaseRequest(request.id, senderName, note);
    const operation = validation.pipe(
      concatMap(() => this.api.acceptPurchaseRequest(request.id, note)),
    );
    return this.run(request, note, senderName, operation);
  }

  requestAdjustment(note: string, senderName: string): Observable<PurchaseRequest> {
    const request = this.request();
    if (!request) return throwError(() => new Error('Purchase request is not loaded.'));
    return this.run(request, note, senderName, this.api.requestPurchaseRequestAdjustment(request.id, note));
  }

  reject(note: string, senderName: string): Observable<PurchaseRequest> {
    const request = this.request();
    if (!request) return throwError(() => new Error('Purchase request is not loaded.'));
    return this.run(request, note, senderName, this.api.rejectPurchaseRequest(request.id, note));
  }

  private run<T>(request: PurchaseRequest, note: string, senderName: string, operation: Observable<T>): Observable<T> {
    this.saving.set(true);
    const action = note.trim()
      ? this.api.sendPurchaseRequestMessage(request.id, note.trim(), senderName).pipe(concatMap(() => operation))
      : operation;
    return action.pipe(
      tap({
        next: () => {
          this.saving.set(false);
          this.load(request.id);
        },
        error: () => this.saving.set(false),
      }),
    );
  }
}
