import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import {
  BusinessDocument,
  InvoicingOrder,
  Payment,
  PaymentMethodRecord,
  PaymentProcess,
} from '@app/invoicing/domain/model';

export interface CreateBusinessDocument {
  orderId: number;
  clientAccountId: number;
  type: string;
  label: string;
  visibleToBuyer: boolean;
  required: boolean;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class InvoicingApi {
  private readonly http = inject(HttpClient);
  private readonly clientsApi = inject(ClientsApi);

  documents(): Observable<BusinessDocument[]> { return this.http.get<BusinessDocument[]>('api/v1/business-documents'); }
  document(id: number): Observable<BusinessDocument> { return this.http.get<BusinessDocument>(`api/v1/business-documents/${id}`); }
  createDocument(resource: CreateBusinessDocument): Observable<BusinessDocument> { return this.http.post<BusinessDocument>('api/v1/business-documents', resource); }
  generateDocument(orderId: number, type: string): Observable<BusinessDocument> { return this.http.post<BusinessDocument>('api/v1/business-documents/generations', { orderId, type }); }
  changeDocumentStatus(id: number, status: string, visibleToBuyer?: boolean): Observable<BusinessDocument> {
    return this.http.post<BusinessDocument>(`api/v1/business-documents/${id}/status-changes`, { status, visibleToBuyer });
  }
  downloadDocument(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`api/v1/business-documents/${id}/content`, { observe: 'response', responseType: 'blob' });
  }

  orders(): Observable<InvoicingOrder[]> { return this.http.get<InvoicingOrder[]>('api/v1/orders'); }
  clients(): Observable<Client[]> { return this.clientsApi.list(); }

  payments(): Observable<Payment[]> { return this.http.get<Payment[]>('api/v1/payments'); }
  confirmPayment(id: number): Observable<Payment> { return this.http.post<Payment>(`api/v1/payments/${id}/confirmations`, {}); }
  rejectPayment(id: number, reason: string): Observable<Payment> { return this.http.post<Payment>(`api/v1/payments/${id}/rejections`, { reason }); }
  cancelPayment(id: number): Observable<Payment> { return this.http.post<Payment>(`api/v1/payments/${id}/cancellations`, {}); }

  paymentProcesses(): Observable<PaymentProcess[]> { return this.http.get<PaymentProcess[]>('api/v1/payment-process-records'); }
  confirmPaymentProcess(id: number): Observable<PaymentProcess> { return this.http.post<PaymentProcess>(`api/v1/payment-process-records/${id}/confirmations`, {}); }
  rejectPaymentProcess(id: number): Observable<PaymentProcess> { return this.http.post<PaymentProcess>(`api/v1/payment-process-records/${id}/rejections`, {}); }

  paymentMethods(): Observable<PaymentMethodRecord[]> { return this.http.get<PaymentMethodRecord[]>('api/v1/payment-method-records'); }
  createPaymentMethod(clientAccountId: number, type: string, label: string, isDefault: boolean): Observable<PaymentMethodRecord> {
    return this.http.post<PaymentMethodRecord>('api/v1/payment-method-records', { clientAccountId, type, label, isDefault });
  }
  changePaymentMethod(id: number, status: string, isDefault: boolean): Observable<PaymentMethodRecord> {
    return this.http.post<PaymentMethodRecord>(`api/v1/payment-method-records/${id}/status-changes`, { status, isDefault });
  }
}
