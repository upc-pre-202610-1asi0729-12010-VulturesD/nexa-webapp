import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Order } from '@app/ordering/domain/model';
import {
  BuyerDeliveryAddress,
  BuyerDashboardSummary,
  BuyerDocument,
  BuyerMessage,
  BuyerPaymentMethod,
  BuyerPaymentOption,
  BuyerPaymentRecord,
  BuyerPromotion,
  BuyerRequest,
  BuyerRequestItem,
  PortalSnapshot,
} from '@app/portal/domain/model';

interface PlatformCatalogItem {
  productId?: string;
  catalogItemId?: string;
  sku?: string;
  itemName?: string;
  name?: string;
  brandName?: string;
  categoryName?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  unit?: string;
  unitPriceAmount?: number;
  price?: number;
  availableStock?: number;
  reservedStock?: number;
  minStock?: number;
  coldChainRequirement?: string;
  temperatureRange?: string;
  isActive?: boolean;
}

interface PlatformCustomer {
  id: number | string;
  tenantId?: number;
  code?: string;
  businessName: string;
  commercialName?: string;
  taxId?: string;
  segment?: string;
  contact?: string;
  contactEmail?: string;
  phone?: string;
  deliveryAddress?: string;
  district?: string;
  province?: string;
  deliveryReference?: string;
  documentProfile?: string;
  paymentCondition?: string;
  monthlyCreditLimit?: number;
  monthlyCreditUsed?: number;
  monthlyCreditAvailable?: number;
  monthlyCreditStatus?: string;
  deliveryPreference?: string;
  portalAccess?: boolean;
  sellerWorkspaceEmail?: string;
  status?: string;
}

interface PlatformOrderItem {
  productId?: number | string;
  sku?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  unitPrice?: number;
  price?: number;
}

interface PlatformOrder {
  id: string;
  backendId?: number;
  orderNumber?: string;
  clientId: string;
  status: string;
  priority?: string;
  date: string;
  deliveryDate?: string;
  total: number;
  notes?: string;
  items?: PlatformOrderItem[];
}

interface PlatformPayment {
  id: string;
  backendId?: number;
  invoiceId: number | string;
  invoiceCode: string;
  orderId?: string;
  referenceCode: string;
  amount: number;
  currency: string;
  status: string;
}

interface PlatformPaymentMethod {
  id: number | string;
  clientAccountId: number | string;
  label: string;
  type: string;
  status: string;
  isDefault: boolean;
}

interface PlatformBusinessDocument {
  id: number;
  orderId?: number | null;
  clientAccountId?: number | null;
  type: string;
  label: string;
  fileName?: string;
  status: string;
  visibleToBuyer: boolean;
  required: boolean;
}

export interface PlatformReferenceOption {
  id: number;
  code: string;
  label: string;
  parentCode?: string;
}



export interface StripePreparationResponse {
  configured: boolean;
  ready: boolean;
  status: string;
  message: string;
  checkoutUrl?: string | null;
  clientSecret?: string | null;
}

interface UpsertCustomerPayload {
  code?: string;
  businessName: string;
  commercialName?: string;
  taxId: string;
  segment?: string;
  contact?: string;
  contactEmail?: string;
  phone?: string;
  deliveryAddress?: string;
  district?: string;
  province?: string;
  deliveryReference?: string;
  documentProfile?: string;
  paymentCondition?: string;
  monthlyCreditLimit?: number;
  monthlyCreditUsed?: number;
  monthlyCreditStatus?: string;
  deliveryPreference?: string;
  portalAccess?: boolean;
  sellerWorkspaceEmail?: string;
  status?: string;
}

interface PlatformPromotion {
  id: string;
  name: string;
  description: string;
  discountLabel?: string;
  visibility?: string;
  status?: string;
  productIds?: string[];
  notes?: string;
}

interface PlatformPurchaseRequest {
  id: number;
  code: string;
  clientAccountId?: number | null;
  clientId?: string;
  status: string;
  priority: string;
  requestedDeliveryDate?: string | null;
  deliveryReference?: string;
  deliveryAddressId?: string;
  paymentOption?: string;
  documentProfile?: string;
  comments?: string;
  createdAt: string;
  items?: BuyerRequestItem[];
}

interface PlatformConversationMessage {
  id: number;
  clientAccountId?: number | null;
  purchaseRequestId?: number | null;
  senderRole: string;
  senderName: string;
  body: string;
  visibleToBuyer: boolean;
  createdAt: string;
}

interface PlatformBuyerOrderLifecycle {
  order: { id: number; orderNumber: string };
  dispatchEvents: { id: number; status: string; description: string; visibleToBuyer: boolean; createdAt: string }[];
  temperatureLogs: { id: number; celsius: number; status: string; recordedAt: string }[];
}

export interface SubmitBuyerRequestPayload {
  clientId: string;
  requestedDeliveryDate: string;
  deliveryAddressId: string;
  deliveryAddress: string;
  deliveryDistrict?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  paymentOption?: string;
  shippingEstimate?: number;
  comments: string;
  items: {
    productId: string;
    qty: number;
    unit?: string;
  }[];
}


@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);

  getDepartments(): Observable<PlatformReferenceOption[]> {
    return this.http.get<PlatformReferenceOption[]>('api/v1/reference/departments').pipe(
      catchError(() => of([]))
    );
  }

  getProvinces(): Observable<PlatformReferenceOption[]> {
    return this.http.get<PlatformReferenceOption[]>('api/v1/reference/provinces').pipe(
      catchError(() => of([]))
    );
  }

  getDistricts(): Observable<PlatformReferenceOption[]> {
    return this.http.get<PlatformReferenceOption[]>('api/v1/reference/districts').pipe(
      catchError(() => of([]))
    );
  }

  load(clientId: string): Observable<PortalSnapshot> {

    return forkJoin({
      products: this.getProducts(),
      client: this.getBuyerClient(),
      orders: this.getOrders(clientId),
      requests: this.getRequests(clientId),
      messages: this.getMessages(),
      documents: this.getDocuments(clientId),
      payments: this.getPayments(clientId),
      paymentMethods: this.getPaymentMethods(clientId),
      paymentOptions: this.getPaymentOptions(),
      promotions: this.getPromotions(),
      dashboardSummary: this.getDashboardSummary(),
    }).pipe(
      switchMap((core) => {
        const lifecycleRequests = core.orders
          .filter((order) => order.backendId != null)
          .map((order) => this.getOrderLifecycle(order.backendId!));
        return (lifecycleRequests.length ? forkJoin(lifecycleRequests) : of([] as PlatformBuyerOrderLifecycle[]))
          .pipe(map((lifecycles) => ({ core, lifecycles })));
      }),
      map(({ core, lifecycles }) => {
        const { products, client, orders, requests, messages, documents, payments, paymentMethods,
          paymentOptions, promotions, dashboardSummary } = core;
        const catalog = products.filter((product) => product.status !== 'out' && product.isVisibleToBuyer !== false);
        const myDocs = documents.map((document) => {
          const order = orders.find((item) => item.backendId === Number(document.orderId));
          return { ...document, orderId: order?.id ?? document.orderId };
        });
        const orderEvents = lifecycles.flatMap((lifecycle) => lifecycle.dispatchEvents.map((event) => ({
          id: String(event.id),
          orderId: lifecycle.order.orderNumber,
          status: event.status,
          label: event.description || event.status,
          timestamp: event.createdAt,
          visibleToBuyer: event.visibleToBuyer,
        })));
        const temperatureLogs = lifecycles.flatMap((lifecycle) => lifecycle.temperatureLogs.map((reading) => ({
          id: String(reading.id),
          orderId: lifecycle.order.orderNumber,
          timestamp: reading.recordedAt,
          temperatureC: Number(reading.celsius),
          status: reading.status,
        })));

        return {
          myOrders: orders,
          products: catalog,
          client,
          requests,
          documents: myDocs,
          paymentMethods,
          paymentOptions,
          payments,
          promotions,
          deliveryAddresses: this.deliveryAddresses(client),
          messages: this.mapMessages(messages, requests, clientId),
          orderEvents,
          temperatureLogs,
          dashboardSummary: dashboardSummary ?? undefined,
        };
      }),
    );
  }

  submitPurchaseRequest(payload: SubmitBuyerRequestPayload): Observable<BuyerRequest> {
    return this.http.post<PlatformPurchaseRequest>('api/v1/purchase-requests', {
      clientId: payload.clientId,
      origin: 'buyer_portal',
      status: 'submitted',
      priority: 'normal',
      requestedDeliveryDate: payload.requestedDeliveryDate,
      deliveryAddress: payload.deliveryAddress,
      deliveryDistrict: payload.deliveryDistrict || '',
      deliveryCity: payload.deliveryCity || '',
      deliveryProvince: payload.deliveryProvince || '',
      deliveryReference: payload.deliveryAddressId,
      paymentOption: payload.paymentOption || 'credit_line',
      shippingEstimate: payload.shippingEstimate || 0,
      comments: payload.comments,
      items: payload.items.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unit: item.unit || 'UN',
      })),
    }).pipe(map((item) => this.fromPurchaseRequest(item)));
  }


  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`api/v1/business-documents/${id}/content`, { responseType: 'blob' });
  }

  updateBuyerClient(client: Client): Observable<Client> {
    return this.http.put<PlatformCustomer>('api/v1/profile/client-account', this.toCustomerPayload(client)).pipe(
      map((item) => this.fromCustomer(item)),
    );
  }

  setDefaultPaymentMethod(id: string): Observable<BuyerPaymentMethod> {
    return this.http.post<PlatformPaymentMethod>(`api/v1/payment-method-records/${id}/status-changes`, {
      status: 'active',
      isDefault: true,
    }).pipe(map((item) => ({
      id: String(item.id),
      clientId: this.customerId(item.clientAccountId),
      label: item.label,
      type: item.type,
      status: item.status,
      isDefault: item.isDefault,
    })));
  }

  addPaymentMethod(clientId: string, type: string, label: string, isDefault: boolean): Observable<BuyerPaymentMethod> {
    const clientAccountId = Number(clientId.replace(/\D/g, ''));
    return this.http.post<PlatformPaymentMethod>('api/v1/payment-method-records', {
      clientAccountId,
      type,
      label,
      isDefault,
    }).pipe(map((item) => ({
      id: String(item.id),
      clientId: this.customerId(item.clientAccountId),
      label: item.label,
      type: item.type,
      status: item.status,
      isDefault: item.isDefault,
    })));
  }

  prepareStripeCheckout(payment: BuyerPaymentRecord): Observable<StripePreparationResponse> {
    return this.http.post<StripePreparationResponse>('api/v1/payments/stripe/checkout-sessions', {
      paymentId: payment.backendId,
      amount: payment.amount,
      currency: payment.currency,
      successUrl: `${window.location.origin}/portal/payment-methods?stripe=success`,
      cancelUrl: `${window.location.origin}/portal/payment-methods?stripe=cancelled`,
    });
  }

  private getProducts(): Observable<Product[]> {
    return this.http.get<PlatformCatalogItem[]>('api/v1/catalog-items').pipe(
      map((items) => items.map((item) => this.fromCatalogItem(item))),
      catchError(() => of([] as Product[])),
    );
  }

  private getBuyerClient(): Observable<Client | null> {
    return this.http.get<PlatformCustomer>('api/v1/profile/client-account').pipe(
      map((item) => this.fromCustomer(item)),
      catchError(() => of(null)),
    );
  }

  private getPromotions(): Observable<BuyerPromotion[]> {
    return this.http.get<PlatformPromotion[]>('api/v1/promotions').pipe(
      map((items) => items
        .filter((item) => item.status?.toLowerCase() !== 'inactive')
        .map((item): BuyerPromotion => ({
          id: item.id,
          name: item.name,
          title: item.name,
          description: item.description,
          discountLabel: item.discountLabel,
          visibility: item.visibility === 'client_specific' ? 'client_specific' : 'buyer_portal',
          status: item.status,
          productIds: item.productIds ?? [],
          notes: item.notes,
        }))),
      catchError(() => of([] as BuyerPromotion[])),
    );
  }

  private getDashboardSummary(): Observable<BuyerDashboardSummary | null> {
    return this.http.get<BuyerDashboardSummary>('api/v1/buyer/dashboard-summary').pipe(
      catchError(() => of(null)),
    );
  }

  private getOrderLifecycle(orderId: number): Observable<PlatformBuyerOrderLifecycle> {
    return this.http.get<PlatformBuyerOrderLifecycle>(`api/v1/buyer/orders/${orderId}/lifecycle`);
  }

  private getOrders(clientId: string): Observable<Order[]> {
    return this.http.get<PlatformOrder[]>('api/v1/orders').pipe(
      map((items) => items.map((item) => this.fromOrder(item))),
      catchError(() => of([])),
    );
  }

  private getRequests(clientId: string): Observable<BuyerRequest[]> {
    return this.http.get<PlatformPurchaseRequest[]>('api/v1/purchase-requests').pipe(
      map((items) => items.map((item) => this.fromPurchaseRequest(item))),
      catchError(() => of([])),
    );
  }

  private getMessages(): Observable<PlatformConversationMessage[]> {
    return this.http.get<PlatformConversationMessage[]>('api/v1/conversation-messages').pipe(
      catchError(() => of([])),
    );
  }

  private getDocuments(clientId: string): Observable<BuyerDocument[]> {
    return this.http.get<PlatformBusinessDocument[]>('api/v1/business-documents').pipe(
      map((items) => items
        .filter((item) => item.visibleToBuyer)
        .map((item) => ({
          id: String(item.id),
          clientId: this.customerId(item.clientAccountId ?? ''),
          orderId: item.orderId == null ? undefined : String(item.orderId),
          label: item.label,
          fileName: item.fileName,
          type: item.type,
          status: item.status,
          visibleToBuyer: item.visibleToBuyer,
          required: item.required,
        }))),
      catchError(() => of([])),
    );
  }

  private getPayments(clientId: string): Observable<BuyerPaymentRecord[]> {
    return this.http.get<PlatformPayment[]>('api/v1/payments').pipe(
      map((items) => items.map((item) => ({ ...item, invoiceId: String(item.invoiceId), clientId }))),
      catchError(() => of([])),
    );
  }

  private getPaymentMethods(clientId: string): Observable<BuyerPaymentMethod[]> {
    return this.http.get<PlatformPaymentMethod[]>('api/v1/payment-method-records').pipe(
      map((items) => items
        .map((item) => ({
          id: String(item.id),
          clientId: this.customerId(item.clientAccountId),
          label: item.label,
          type: item.type,
          status: item.status,
          isDefault: item.isDefault,
        }))),
      catchError(() => of([])),
    );
  }

  private getPaymentOptions(): Observable<BuyerPaymentOption[]> {
    return this.http.get<PlatformReferenceOption[]>('api/v1/reference/payment-options').pipe(
      map((items) => items.map(({ id, code, label }) => ({ id, code, label }))),
      catchError(() => of([])),
    );
  }



  private fromCatalogItem(item: PlatformCatalogItem): Product {
    const productId = item.productId || item.sku || item.catalogItemId || '';
    const category = item.categoryName || item.category || 'Catalog';
    const temperatureRange = item.temperatureRange || this.coldRequirementToRange(item.coldChainRequirement);
    const stock = Number(item.availableStock ?? 0);
    return {
      id: productId,
      sku: item.sku || productId,
      catalogItemId: item.catalogItemId,
      productId,
      name: item.itemName || item.name || productId,
      category,
      cat: this.categoryToCat(category),
      temp: temperatureRange,
      temperatureRange,
      coldType: this.coldRequirementToType(item.coldChainRequirement),
      unit: item.unit || 'UN',
      price: Number(item.unitPriceAmount ?? item.price ?? 0),
      stock,
      reserved: Number(item.reservedStock ?? 0),
      minStock: Number(item.minStock ?? Math.max(10, Math.round(stock * 0.2))),
      warehouse: 'Core backend',
      zone: category,
      status: item.isActive === false || stock <= 0 ? 'out' : 'ok',
      imageUrl: item.imageUrl,
      brand: item.brandName,
      brandName: item.brandName,
      commercialAvailability: item.isActive === false ? 'Inactive' : 'Available',
      isVisibleToBuyer: item.isActive !== false,
      description: item.description,
      weightKg: 1,
      knowledge: item.description,
    };
  }

  private fromCustomer(item: PlatformCustomer): Client {
    return {
      id: this.customerId(item.id),
      backendId: Number(item.id),
      tenantId: item.tenantId,
      code: item.code,
      name: item.businessName,
      businessName: item.businessName,
      commercialName: item.commercialName,
      ruc: item.taxId,
      taxId: item.taxId,
      segment: item.segment,
      contact: item.contact,
      contactEmail: item.contactEmail,
      phone: item.phone,
      address: item.deliveryAddress,
      deliveryAddress: item.deliveryAddress,
      district: item.district,
      province: item.province,
      deliveryReference: item.deliveryReference,
      documentProfile: item.documentProfile,
      condition: item.paymentCondition,
      paymentCondition: item.paymentCondition,
      status: item.status,
      type: item.segment,
      creditLimit: Number(item.monthlyCreditLimit ?? 0),
      creditUsed: Number(item.monthlyCreditUsed ?? 0),
      monthlyCreditLimit: Number(item.monthlyCreditLimit ?? 0),
      monthlyCreditUsed: Number(item.monthlyCreditUsed ?? 0),
      monthlyCreditAvailable: Number(item.monthlyCreditAvailable ?? 0),
      monthlyCreditStatus: item.monthlyCreditStatus,
      deliveryPreference: item.deliveryPreference,
      portalAccess: item.portalAccess,
      sellerWorkspaceEmail: item.sellerWorkspaceEmail,
    };
  }

  private toCustomerPayload(client: Client): UpsertCustomerPayload {
    return {
      code: client.code || client.id,
      businessName: client.businessName || client.name,
      commercialName: client.commercialName || client.name,
      taxId: client.taxId || client.ruc || 'UNKNOWN',
      segment: client.segment || client.type || 'B2B',
      contact: client.contact || '',
      contactEmail: client.contactEmail || '',
      phone: client.phone || '',
      deliveryAddress: client.deliveryAddress || client.address || '',
      district: client.district || '',
      province: client.province || '',
      deliveryReference: client.deliveryReference || '',
      documentProfile: client.documentProfile || '',
      paymentCondition: client.paymentCondition || client.condition || 'credit_15',
      monthlyCreditLimit: Number(client.monthlyCreditLimit ?? client.creditLimit ?? 0),
      monthlyCreditUsed: Number(client.monthlyCreditUsed ?? client.creditUsed ?? 0),
      monthlyCreditStatus: client.monthlyCreditStatus || 'ok',
      deliveryPreference: client.deliveryPreference || '',
      portalAccess: client.portalAccess !== false,
      sellerWorkspaceEmail: client.sellerWorkspaceEmail || '',
      status: client.status || 'active',
    };
  }

  private fromOrder(item: PlatformOrder): Order {
    return {
      id: item.id || item.orderNumber || '',
      backendId: item.backendId,
      clientId: item.clientId,
      status: item.status,
      priority: item.priority,
      date: item.date,
      deliveryDate: item.deliveryDate,
      total: Number(item.total ?? 0),
      notes: item.notes,
      items: (item.items ?? []).map((line) => ({
        productId: line.sku || String(line.productId ?? ''),
        name: line.name,
        qty: Number(line.quantity ?? line.qty ?? 0),
        price: Number(line.unitPrice ?? line.price ?? 0),
        stockOk: true,
      })),
    };
  }

  private fromPurchaseRequest(item: PlatformPurchaseRequest): BuyerRequest {
    const clientId = item.clientId || (item.clientAccountId ? this.customerId(item.clientAccountId) : '');
    return {
      id: item.code || String(item.id),
      backendId: item.id,
      clientId,
      status: item.status,
      priority: item.priority,
      requestedDeliveryDate: item.requestedDeliveryDate ?? '',
      deliveryAddressId: item.deliveryAddressId || item.deliveryReference || '',
      documentProfile: item.documentProfile || item.paymentOption || '',
      comments: item.comments || '',
      createdAt: item.createdAt,
      items: item.items ?? [],
    };
  }

  private customerId(id: number | string): string {
    if (typeof id === 'number') return `CLI-${String(id).padStart(3, '0')}`;
    if (/^\d+$/.test(id)) return `CLI-${id.padStart(3, '0')}`;
    return id;
  }

  private categoryToCat(category: string): string {
    const map: Record<string, string> = {
      Cheese: 'cheese',
      Charcuterie: 'charcuterie',
      Butter: 'butter',
      Dessert: 'dessert',
    };
    return map[category] ?? category.toLowerCase().replace(/\s+/g, '-');
  }

  private coldRequirementToType(requirement = ''): string {
    const normalized = requirement.toLowerCase();
    if (normalized.includes('frozen')) return 'frozen';
    if (normalized.includes('refrigerated')) return 'chilled';
    return 'ambient';
  }

  private coldRequirementToRange(requirement = ''): string {
    const normalized = requirement.toLowerCase();
    if (normalized.includes('frozen')) return '-18°C';
    if (normalized.includes('refrigerated')) return '2°C - 8°C';
    return 'Ambient';
  }

  private deliveryAddresses(client: Client | null): BuyerDeliveryAddress[] {
    if (!client?.deliveryAddress) return [];
    return [{
      id: client.deliveryReference || `client-${client.backendId ?? client.id}`,
      clientId: client.id,
      label: client.deliveryPreference || client.commercialName || client.name,
      address: client.deliveryAddress,
      window: client.deliveryPreference || '',
    }];
  }

  private mapMessages(items: PlatformConversationMessage[], requests: BuyerRequest[], clientId: string): BuyerMessage[] {
    return items.flatMap((item) => {
      const request = requests.find((candidate) => candidate.backendId === item.purchaseRequestId);
      if (!request || !item.visibleToBuyer) return [];
      return [{
        id: String(item.id),
        requestId: request.id,
        clientId,
        senderRole: item.senderRole,
        senderName: item.senderName,
        body: item.body,
        createdAt: item.createdAt,
      }];
    });
  }
}
