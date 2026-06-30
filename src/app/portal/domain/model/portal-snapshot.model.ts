import { Client } from '@app/clients/domain/model';
import { Order } from '@app/ordering/domain/model';
import { Product } from '@app/catalog/domain/model';

/**
 * Aggregate view shown in the buyer portal once they log in.
 * Combines the buyer's client profile, available catalog, and own order history.
 */
export interface PortalSnapshot {
  myOrders: Order[];
  products: Product[];
  client: Client | null;
  requests: BuyerRequest[];
  documents: BuyerDocument[];
  paymentMethods: BuyerPaymentMethod[];
  paymentOptions: BuyerPaymentOption[];
  payments: BuyerPaymentRecord[];
  promotions: BuyerPromotion[];
  deliveryAddresses: BuyerDeliveryAddress[];
  messages: BuyerMessage[];
  orderEvents: BuyerOrderEvent[];
  temperatureLogs: BuyerTemperatureLog[];
  dashboardSummary?: BuyerDashboardSummary;
}

export interface BuyerPaymentOption {
  id: number;
  code: string;
  label: string;
}

export interface BuyerDashboardSummary {
  activePurchaseRequestsCount: number;
  activeOrdersCount: number;
  pendingDocumentsCount: number;
  pendingInvoicesCount: number;
  creditSummary?: {
    creditLimit: number;
    usedCredit: number;
    availableCredit: number;
    status: string;
    estimated: boolean;
  } | null;
}

export interface BuyerRequestItem {
  productId: string;
  name: string;
  qty: number;
  unit?: string;
  price?: number;
}

export interface BuyerRequest {
  id: string;
  backendId?: number;
  clientId: string;
  status: string;
  priority: string;
  requestedDeliveryDate: string;
  deliveryAddressId?: string;
  documentProfile?: string;
  comments: string;
  items: BuyerRequestItem[];
  createdAt: string;
}

export interface BuyerDocument {
  id: string;
  clientId: string;
  orderId?: string;
  label?: string;
  fileName?: string;
  type: string;
  status: string;
  visibleToBuyer?: boolean;
  required?: boolean;
  dueDate?: string;
  amount?: number;
}

export interface BuyerPaymentMethod {
  id: string;
  clientId: string;
  label: string;
  type: string;
  status: string;
  brand?: string;
  last4?: string;
  holderName?: string;
  isDefault?: boolean;
}

export interface BuyerPaymentRecord {
  id: string;
  backendId?: number;
  clientId: string;
  invoiceId: string;
  invoiceCode: string;
  orderId?: string;
  referenceCode: string;
  amount: number;
  currency: string;
  status: string;
}

export interface BuyerPromotion {
  id: string;
  name?: string;
  title: string;
  description: string;
  discountLabel?: string;
  notes?: string;
  status?: string;
  visibility: 'buyer' | 'client' | 'buyer_portal' | 'client_specific';
  productIds?: string[];
}

export interface BuyerDeliveryAddress {
  id: string;
  clientId: string;
  label: string;
  address: string;
  window: string;
}

export interface BuyerMessage {
  id: string;
  requestId: string;
  clientId: string;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface BuyerOrderEvent {
  id: string;
  orderId: string;
  label: string;
  status: string;
  timestamp: string;
  visibleToBuyer?: boolean;
}

export interface BuyerTemperatureLog {
  id: string;
  orderId: string;
  timestamp: string;
  temperatureC: number;
  status: string;
}

export type PortalSection =
  | 'catalog'
  | 'request-builder'
  | 'requests'
  | 'orders'
  | 'documents'
  | 'payments'
  | 'premium'
  | 'profile'
  | 'terms'
  | 'privacy'
  | 'support';
