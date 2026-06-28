export interface OrderItem {
  productId: string; qty: number; price: number;
  backendProductId?: number;
  name?: string; stockOk?: boolean;
}

export interface Order {
  id: string; clientId: string;
  backendId?: number;
  tenantId?: number;
  orderNumber?: string;
  customerId?: number;
  customer?: string;
  status: string; priority?: string;
  date: string; items: OrderItem[];
  total: number; notes?: string;
  deliveryDate?: string;
  paymentConfirmation?: string;
  inventoryReservation?: string;
  rejectionReason?: string;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
