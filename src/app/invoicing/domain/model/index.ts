export interface BusinessDocument {
  id: number;
  tenantId: number;
  orderId: number | null;
  clientAccountId: number | null;
  documentTypeId: number | null;
  type: string;
  label: string;
  status: string;
  fileName: string;
  visibleToBuyer: boolean;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicingOrderItem {
  productId: number | string;
  name?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface InvoicingOrder {
  id: string;
  backendId: number;
  orderNumber: string;
  customerId: number;
  clientId: string;
  customer: string;
  status: string;
  priority: string;
  date: string;
  deliveryDate?: string;
  items: InvoicingOrderItem[];
  total: number;
  notes?: string;
}

export interface Payment {
  id: string;
  backendId: number;
  invoiceId: number;
  invoiceCode: string;
  orderId: string;
  referenceCode: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  tenantId: number;
  clientAccountId: number;
  paymentMethodRecordId: number | null;
  rejectionReason?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProcess {
  id: number;
  tenantId: number;
  orderId: number | null;
  clientAccountId: number | null;
  paymentId: number | null;
  paymentMethodRecordId: number | null;
  subtotal: number;
  discount: number;
  shipping: number;
  igv: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodRecord {
  id: number;
  tenantId: number;
  clientAccountId: number;
  type: string;
  label: string;
  status: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDocumentCard {
  order: InvoicingOrder;
  documents: BusinessDocument[];
  required: { type: string; document: BusinessDocument | null; status: string }[];
  readyCount: number;
  missingCount: number;
}
