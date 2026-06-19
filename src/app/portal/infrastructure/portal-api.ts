import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { Product } from '@app/catalog/domain/model';
import { Order } from '@app/ordering/domain/model';
import {
  BuyerDeliveryAddress,
  BuyerDocument,
  BuyerMessage,
  BuyerOrderEvent,
  BuyerPaymentMethod,
  BuyerPaymentRecord,
  BuyerPromotion,
  BuyerRequest,
  BuyerRequestItem,
  BuyerTemperatureLog,
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
  businessName: string;
  taxId?: string;
  contactEmail?: string;
  deliveryAddress?: string;
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
  invoiceId: number | string;
  invoiceCode: string;
  orderId?: string;
  referenceCode: string;
  amount: number;
  currency: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);

  load(clientId: string): Observable<PortalSnapshot> {
    return forkJoin({
      products: this.getProducts(),
      clients: this.getClients(),
      orders: this.getOrders(clientId),
      requests: this.getRequests(clientId),
      documents: this.getDocuments(clientId),
      payments: this.getPayments(clientId),
    }).pipe(
      map(({ products, clients, orders, requests, documents, payments }) => {
        const catalog = products.filter((product) => product.status !== 'out' && product.isVisibleToBuyer !== false);
        const client = this.sourceClient(clientId, clients.find((item) => item.id === clientId) ?? null);
        const defaultOrders = this.buildOrders(clientId);
        const myOrders = [
          ...defaultOrders,
          ...orders.filter(o => !defaultOrders.some(doItem => doItem.id === o.id))
        ];

        const defaultRequests = this.buildRequests(clientId, catalog);
        const myRequests = [
          ...defaultRequests,
          ...requests.filter(r => !defaultRequests.some(drItem => drItem.id === r.id))
        ];

        const defaultDocs = this.buildDocuments(clientId);
        const myDocs = [
          ...defaultDocs,
          ...documents.filter(d => !defaultDocs.some(ddItem => ddItem.id === d.id))
        ];

        return {
          myOrders,
          products: catalog,
          client,
          requests: myRequests,
          documents: myDocs,
          paymentMethods: this.buildPaymentMethods(clientId),
          payments: payments.length ? payments : this.buildPayments(clientId),
          promotions: this.buildPromotions(catalog),
          deliveryAddresses: this.buildDeliveryAddresses(clientId),
          messages: this.buildMessages(clientId),
          orderEvents: this.buildOrderEvents(),
          temperatureLogs: this.buildTemperatureLogs(),
        };
      }),
    );
  }

  private getProducts(): Observable<Product[]> {
    return this.http.get<PlatformCatalogItem[]>('api/v1/catalog-items').pipe(
      map((items) => items.map((item) => this.fromCatalogItem(item))),
      catchError(() => of([] as Product[])),
    );
  }

  private getClients(): Observable<Client[]> {
    return this.http.get<PlatformCustomer[]>('api/v1/customers').pipe(
      map((items) => items.map((item) => this.fromCustomer(item))),
      catchError(() => of([] as Client[])),
    );
  }

  private getOrders(clientId: string): Observable<Order[]> {
    return this.http.get<PlatformOrder[]>('api/v1/orders').pipe(
      map((items) => items.filter((item) => item.clientId === clientId).map((item) => this.fromOrder(item))),
      catchError(() => of([])),
    );
  }

  private getRequests(clientId: string): Observable<BuyerRequest[]> {
    return this.http.get<BuyerRequest[]>('api/v1/purchase-requests').pipe(
      map((items) => items.filter((item) => item.clientId === clientId)),
      catchError(() => of([])),
    );
  }

  private getDocuments(clientId: string): Observable<BuyerDocument[]> {
    return this.http.get<BuyerDocument[]>('api/v1/documents').pipe(
      map((items) => items.filter((item) => item.clientId === clientId)),
      catchError(() => of([])),
    );
  }

  private getPayments(clientId: string): Observable<BuyerPaymentRecord[]> {
    return this.http.get<PlatformPayment[]>('api/v1/payments').pipe(
      map((items) => items.map((item) => ({ ...item, invoiceId: String(item.invoiceId), clientId }))),
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
      name: item.businessName,
      ruc: item.taxId,
      contact: item.contactEmail,
      address: item.deliveryAddress,
      condition: 'Credit 30 days',
      status: 'active',
      type: 'B2B Buyer',
      creditLimit: 0,
      creditUsed: 0,
    };
  }

  private fromOrder(item: PlatformOrder): Order {
    return {
      id: item.id || item.orderNumber || '',
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

  private sourceClient(clientId: string, fallback: Client | null): Client | null {
    if (clientId !== 'CLI-001') return fallback;
    return {
      id: 'CLI-001',
      name: 'Importaciones y Comercio Internacional S.A.',
      commercialName: 'ICISA',
      ruc: '20600000001',
      contact: 'Elena Litano',
      phone: '+51 987 654 321',
      condition: 'Credit 30 days',
      status: 'active',
      type: 'B2B Buyer',
      address: 'Av. Argentina 2450, Callao',
      lastOrder: '2026-06-11',
      creditLimit: 52000,
      creditUsed: 18400,
    };
  }

  private buildRequests(clientId: string, products: Product[]): BuyerRequest[] {
    if (clientId !== 'CLI-001') return [];

    return [
      {
        id: 'PR-2026-0001',
        clientId,
        status: 'submitted',
        priority: 'high',
        requestedDeliveryDate: '2026-06-13',
        deliveryAddressId: 'ADDR-001',
        documentProfile: 'invoice_guide_pod',
        comments: 'Prioritize chilled products for weekend demand.',
        createdAt: '2026-06-10T09:10:00Z',
        items: [
          this.requestItem(products, 'PROD-0004', 3, 'box', 690, 'MORTADELLA BOLOGNA IGP CON PISTACCHIO MOLDE 7.5KG'),
          this.requestItem(products, 'PROD-0013', 2, 'box', 112.1, 'QUESO EDAM BOLA MOLDE 1.9KG'),
        ],
      },
      {
        id: 'REQ-2026-0004',
        clientId,
        status: 'submitted',
        priority: 'normal',
        requestedDeliveryDate: '2026-06-13',
        deliveryAddressId: 'ADDR-001',
        documentProfile: 'invoice_guide_pod',
        comments: 'nose',
        createdAt: '2026-06-10T04:36:46.906Z',
        items: [this.requestItem(products, 'PROD-0001', 1, 'UN', 17.3, 'QUESO GRANA PADANO DOP 150G')],
      },
    ];
  }

  private buildOrders(clientId: string): Order[] {
    if (clientId !== 'CLI-001') return [];
    return [
      {
        id: 'ORD-2026-0001',
        clientId,
        status: 'pending',
        priority: 'high',
        date: '2026-06-06',
        deliveryDate: '2026-06-13',
        total: 2294.2,
        notes: 'Pending commercial and dispatch coordination for ICISA.',
        items: [
          { productId: 'PROD-0004', name: 'MORTADELLA BOLOGNA IGP CON PISTACCHIO MOLDE 7.5KG', qty: 3, price: 690, stockOk: true },
          { productId: 'PROD-0013', name: 'QUESO EDAM BOLA MOLDE 1.9KG', qty: 2, price: 112.1, stockOk: true },
        ],
      },
      {
        id: 'ORD-2026-0006',
        clientId,
        status: 'pending',
        priority: 'normal',
        date: '2026-06-11',
        deliveryDate: '2026-06-14',
        total: 1506,
        notes: 'Second pending source order for buyer history.',
        items: [
          { productId: 'PROD-0019', name: 'QUESO GOUDA COMINO MOLDE 4.5KG', qty: 4, price: 283.5, stockOk: true },
          { productId: 'PROD-0048', name: 'QUESO MANCHEGO DOP 6 MESES MOLDE 3KG', qty: 1, price: 372, stockOk: true },
        ],
      },
    ];
  }

  private buildDocuments(clientId: string): BuyerDocument[] {
    if (clientId !== 'CLI-001') return [];
    return [
      {
        id: 'INV-2026-0001',
        clientId,
        orderId: 'ORD-2026-0001',
        type: 'Invoice',
        label: 'INV-2026-0001',
        fileName: 'INV-2026-0001.pdf',
        status: 'accepted',
        visibleToBuyer: true,
        required: true,
        dueDate: '2026-06-12',
        amount: 2294.2,
      },
      {
        id: 'GR-2026-0001',
        clientId,
        orderId: 'ORD-2026-0001',
        type: 'Dispatch guide',
        label: 'Dispatch guide ORD-2026-0001',
        fileName: 'dispatch-guide-ORD-2026-0001.pdf',
        status: 'pending',
        visibleToBuyer: false,
        required: true,
        dueDate: '2026-06-13',
      },
      {
        id: 'POD-2026-0001',
        clientId,
        orderId: 'ORD-2026-0001',
        type: 'Proof of delivery',
        label: 'Proof of delivery',
        fileName: 'pod-receipt.png',
        status: 'pending',
        visibleToBuyer: false,
        required: true,
        dueDate: '2026-06-13',
      },
      {
        id: 'INV-2026-0006',
        clientId,
        orderId: 'ORD-2026-0006',
        type: 'Invoice',
        label: 'INV-2026-0006',
        fileName: 'INV-2026-0006.pdf',
        status: 'pending',
        visibleToBuyer: true,
        required: true,
        dueDate: '2026-06-18',
        amount: 1506,
      },
    ];
  }

  private buildPaymentMethods(clientId: string): BuyerPaymentMethod[] {
    if (clientId !== 'CLI-001') return [];
    return [
      {
        id: 'PM-001',
        clientId,
        label: 'Corporate card',
        type: 'card',
        brand: 'Visa',
        last4: '2841',
        holderName: 'ICISA Procurement',
        isDefault: true,
        status: 'active',
      },
      {
        id: 'PM-002',
        clientId,
        label: 'Transfer reference',
        type: 'wallet',
        brand: 'Bank transfer',
        last4: '0198',
        holderName: 'ICISA Treasury',
        isDefault: false,
        status: 'active',
      },
    ];
  }

  private buildPayments(clientId: string): BuyerPaymentRecord[] {
    if (clientId !== 'CLI-001') return [];
    return [
      { id: 'PAY-2026-0001', clientId, invoiceId: '1', invoiceCode: 'INV-2026-0001', orderId: 'ORD-2026-0001', referenceCode: 'PAY-2026-0001', amount: 2294.2, currency: 'PEN', status: 'paid' },
      { id: 'PAY-2026-0006', clientId, invoiceId: '6', invoiceCode: 'INV-2026-0006', orderId: 'ORD-2026-0006', referenceCode: 'PAY-2026-0006', amount: 1506, currency: 'PEN', status: 'pending' },
    ];
  }

  private buildDeliveryAddresses(clientId: string): BuyerDeliveryAddress[] {
    if (clientId !== 'CLI-001') return [];
    return [
      { id: 'ADDR-001', clientId, label: 'Default address', address: 'Av. Argentina 2450, Callao', window: '' },
    ];
  }

  private buildMessages(clientId: string): BuyerMessage[] {
    if (clientId !== 'CLI-001') return [];
    return [
      {
        id: 'MSG-001',
        requestId: 'PR-2026-0001',
        clientId,
        senderRole: 'buyer',
        senderName: 'Elena Litano',
        body: 'Please prioritize chilled handling for this request.',
        createdAt: '2026-06-10T09:12:00Z',
      },
      {
        id: 'MSG-002',
        requestId: 'PR-2026-0001',
        clientId,
        senderRole: 'commercial',
        senderName: 'Valeria Sanchez',
        body: 'Sales is validating stock and route capacity.',
        createdAt: '2026-06-10T09:35:00Z',
      },
    ];
  }

  private buildOrderEvents(): BuyerOrderEvent[] {
    return [
      { id: 'EV-0001', orderId: 'ORD-2026-0001', status: 'submitted', label: 'Order submitted', timestamp: '2026-06-10T09:10:00Z' },
      { id: 'EV-0002', orderId: 'ORD-2026-0001', status: 'validating', label: 'Commercial validation started', timestamp: '2026-06-10T09:35:00Z' },
      { id: 'EV-0003', orderId: 'ORD-2026-0006', status: 'submitted', label: 'Order submitted', timestamp: '2026-06-11T10:00:00Z' },
    ];
  }

  private buildTemperatureLogs(): BuyerTemperatureLog[] {
    return [
      { id: 'TEMP-LOG-0001', orderId: 'ORD-2026-0001', timestamp: '2026-06-10T10:10:00Z', temperatureC: 4.2, status: 'ok' },
      { id: 'TEMP-LOG-0002', orderId: 'ORD-2026-0006', timestamp: '2026-06-11T11:20:00Z', temperatureC: 5.1, status: 'ok' },
    ];
  }

  private buildPromotions(products: Product[]): BuyerPromotion[] {
    const cheese = ['PROD-0013', 'PROD-0014'].filter((id) => products.some((product) => product.id === id));
    const charcuterie = ['PROD-0004', 'PROD-0005'].filter((id) => products.some((product) => product.id === id));
    return [
      {
        id: 'PROMO-COLD-001',
        name: 'Chilled cheese rotation',
        title: 'Chilled cheese rotation',
        description: 'Commercial bundle for selected cheese lines with short route windows.',
        discountLabel: '8% commercial adjustment',
        visibility: 'buyer_portal',
        status: 'active',
        productIds: cheese,
        notes: 'Subject to stock and credit validation.',
      },
      {
        id: 'PROMO-COLD-002',
        name: 'Food service charcuterie pack',
        title: 'Food service charcuterie pack',
        description: 'Bundle support for hotels and restaurants with recurring weekly demand.',
        discountLabel: 'Tiered price',
        visibility: 'client_specific',
        status: 'active',
        productIds: charcuterie,
        notes: 'Available for approved B2B buyers.',
      },
    ];
  }

  private requestItem(products: Product[], id: string, qty: number, unit: string, price: number, fallbackName: string): BuyerRequestItem {
    const product = products.find((item) => item.id === id || item.productId === id);
    return {
      productId: id,
      name: product?.name ?? fallbackName,
      qty,
      unit,
      price: product?.price ?? price,
    };
  }
}
