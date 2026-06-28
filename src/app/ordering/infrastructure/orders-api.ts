import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { ClientsApi } from '@app/clients/infrastructure/clients-api';
import { PurchaseRequest } from '@app/ordering/application/purchase-requests.store';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';
import { ProductsApi } from '@app/catalog/infrastructure/products-api';

interface PagedResponse<T> {
  items: T[];
}

interface PlatformOrderItem {
  productId: number;
  sku?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

interface PlatformOrderResource {
  id: string;
  backendId: number;
  tenantId: number;
  orderNumber: string;
  customerId: number;
  clientId: string;
  customer: string;
  status: string;
  priority: string;
  date: string;
  deliveryDate?: string;
  items: PlatformOrderItem[];
  total: number;
  notes?: string;
  paymentConfirmation?: string;
  inventoryReservation?: string;
  rejectionReason?: string;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderTimelineEvent {
  source: string;
  status: string;
  description: string;
  occurredAt: string;
}

export interface OrderTimeline {
  orderId: number;
  orderNumber: string;
  events: OrderTimelineEvent[];
}

interface PurchaseRequestInboxResponse {
  id: number;
  code: string;
  client?: { code: string } | null;
  status: string;
  priority: string;
  createdAt: string;
  requestedDeliveryDate?: string | null;
  lineCount: number;
  lastMessagePreview?: string | null;
}

interface PlatformPurchaseRequest {
  id: number;
  tenantId: number;
  clientAccountId?: number | null;
  code: string;
  origin?: string;
  status: string;
  priority: string;
  requestedDeliveryDate?: string | null;
  deliveryAddress?: string;
  deliveryDistrict?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  deliveryReference?: string;
  paymentOption?: string;
  shippingEstimate?: number | null;
  comments?: string;
  commercialOwner?: string;
  createdAt: string;
  updatedAt?: string;
  clientId?: string;
  deliveryAddressId?: string;
  documentProfile?: string;
  items?: PurchaseRequest['items'];
}

export interface ConversationMessage {
  id: number;
  tenantId: number;
  clientAccountId?: number | null;
  purchaseRequestId?: number | null;
  orderId?: number | null;
  senderRole: string;
  senderName: string;
  body: string;
  visibleToBuyer: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderAcceptance {
  purchaseRequestId: number;
  orderId: number;
  dispatchOrderId?: number | null;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly clientsApi = inject(ClientsApi);
  private readonly productsApi = inject(ProductsApi);

  list() { return this.http.get<PlatformOrderResource[]>('api/v1/orders').pipe(map((items) => items.map((item) => this.fromOrder(item)))); }

  byId(id: string) {
    return this.http.get<PlatformOrderResource>(`api/v1/orders/${id}`).pipe(map((item) => this.fromOrder(item)));
  }

  clients() { return this.clientsApi.list(); }
  products() { return this.productsApi.list(); }
  timeline(id: string | number) { return this.http.get<OrderTimeline>(`api/v1/orders/${this.backendId(id)}/timeline`); }
  confirm(id: string | number, paymentConfirmation: string, inventoryReservation: string) {
    return this.http.post<PlatformOrderResource>(`api/v1/orders/${this.backendId(id)}/confirmations`, { paymentConfirmation, inventoryReservation }).pipe(map((item) => this.fromOrder(item)));
  }
  reject(id: string | number, rejectionReason: string) {
    return this.http.post<PlatformOrderResource>(`api/v1/orders/${this.backendId(id)}/rejections`, { rejectionReason }).pipe(map((item) => this.fromOrder(item)));
  }
  cancel(id: string | number) {
    return this.http.post<PlatformOrderResource>(`api/v1/orders/${this.backendId(id)}/cancellations`, {}).pipe(map((item) => this.fromOrder(item)));
  }
  purchaseRequests() {
    return this.http.get<PlatformPurchaseRequest[]>('api/v1/purchase-requests').pipe(
      map((items) => items.map((item) => this.fromPurchaseRequest(item))),
    );
  }

  purchaseRequestById(id: string): Observable<PurchaseRequest> {
    return this.http.get<PlatformPurchaseRequest>(`api/v1/purchase-requests/${id}`).pipe(
      map((item) => this.fromPurchaseRequest(item)),
    );
  }

  purchaseRequestMessages(purchaseRequestId: number): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>('api/v1/conversation-messages').pipe(
      map((items) => items.filter((item) => item.purchaseRequestId === purchaseRequestId)),
    );
  }

  sendPurchaseRequestMessage(id: string, body: string, senderName: string): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(`api/v1/purchase-requests/${id}/messages`, {
      body,
      senderRole: 'sales',
      senderName,
      visibleToBuyer: true,
    });
  }

  validatePurchaseRequest(id: string, commercialOwner: string, comments: string): Observable<PurchaseRequest> {
    return this.http.post<PlatformPurchaseRequest>(`api/v1/purchase-requests/${id}/commercial-validations`, {
      commercialOwner,
      comments,
    }).pipe(map((item) => this.fromPurchaseRequest(item)));
  }

  requestPurchaseRequestAdjustment(id: string, note: string): Observable<PurchaseRequest> {
    return this.http.post<PlatformPurchaseRequest>(`api/v1/purchase-requests/${id}/adjustment-requests`, { note }).pipe(
      map((item) => this.fromPurchaseRequest(item)),
    );
  }

  rejectPurchaseRequest(id: string, note: string): Observable<PurchaseRequest> {
    return this.http.post<PlatformPurchaseRequest>(`api/v1/purchase-requests/${id}/rejections`, { note }).pipe(
      map((item) => this.fromPurchaseRequest(item)),
    );
  }

  acceptPurchaseRequest(id: string, note: string): Observable<OrderAcceptance> {
    return this.http.post<OrderAcceptance>(`api/v1/purchase-requests/${id}/acceptances`, { note });
  }
  purchaseRequestInbox() {
    return this.http.get<PagedResponse<PurchaseRequestInboxResponse>>('api/v1/sales/purchase-request-inbox').pipe(
      map((page) => page.items.map((item): PurchaseRequest => ({
        id: item.code || String(item.id),
        clientId: item.client?.code ?? '',
        status: item.status,
        priority: item.priority,
        requestedDeliveryDate: item.requestedDeliveryDate ?? '',
        deliveryAddressId: '',
        documentProfile: '',
        comments: item.lastMessagePreview ?? '',
        createdAt: item.createdAt,
        items: [],
        lineCount: item.lineCount,
      }))),
    );
  }

  create(order: Order): Observable<Order> {
    const customerId = order.customerId || this.numericId(order.clientId);
    const items = order.items.map((item) => ({ productId: item.backendProductId || this.numericId(item.productId), quantity: item.qty }));
    if (!customerId || items.some((item) => !item.productId)) {
      return throwError(() => new Error('Order references must use persisted client and product ids.'));
    }
    return this.http.post<PlatformOrderResource>('api/v1/orders', { customerId, items }).pipe(map((item) => this.fromOrder(item)));
  }

  private fromOrder(item: PlatformOrderResource): Order {
    return {
      id: item.orderNumber || item.id,
      backendId: item.backendId,
      tenantId: item.tenantId,
      orderNumber: item.orderNumber,
      customerId: item.customerId,
      clientId: item.clientId,
      customer: item.customer,
      status: item.status,
      priority: item.priority,
      date: item.date || item.createdAt?.slice(0, 10) || '',
      deliveryDate: item.deliveryDate,
      items: (item.items || []).map((line) => ({
        productId: line.sku || String(line.productId),
        backendProductId: line.productId,
        name: line.name,
        qty: Number(line.quantity || 0),
        price: Number(line.unitPrice || 0),
        stockOk: true,
      })),
      total: Number(item.total || 0),
      notes: item.notes,
      paymentConfirmation: item.paymentConfirmation,
      inventoryReservation: item.inventoryReservation,
      rejectionReason: item.rejectionReason,
      confirmedAt: item.confirmedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private backendId(id: string | number): number {
    return typeof id === 'number' ? id : this.numericId(id);
  }

  private numericId(value: string): number {
    const direct = Number(value);
    if (Number.isInteger(direct) && direct > 0) return direct;
    const suffix = value.match(/(\d+)$/)?.[1] || '';
    return Number(suffix) || 0;
  }

  private fromPurchaseRequest(item: PlatformPurchaseRequest): PurchaseRequest {
    const clientId = item.clientId || (item.clientAccountId ? `CLI-${String(item.clientAccountId).padStart(3, '0')}` : '');
    return {
      id: item.code || String(item.id),
      databaseId: item.id,
      tenantId: item.tenantId,
      clientAccountId: item.clientAccountId ?? undefined,
      code: item.code,
      clientId,
      origin: item.origin,
      status: item.status,
      priority: item.priority,
      requestedDeliveryDate: item.requestedDeliveryDate ?? '',
      deliveryAddressId: item.deliveryAddressId || item.deliveryReference || '',
      deliveryAddress: item.deliveryAddress,
      deliveryDistrict: item.deliveryDistrict,
      deliveryCity: item.deliveryCity,
      deliveryProvince: item.deliveryProvince,
      deliveryReference: item.deliveryReference,
      paymentOption: item.paymentOption,
      shippingEstimate: item.shippingEstimate ?? undefined,
      documentProfile: item.documentProfile || item.paymentOption || '',
      comments: item.comments || '',
      commercialOwner: item.commercialOwner,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      items: item.items ?? [],
      lineCount: item.items?.length ?? 0,
    };
  }
}
