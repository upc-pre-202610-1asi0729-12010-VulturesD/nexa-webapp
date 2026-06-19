export interface OrderItem {
  productId: string; qty: number; price: number;
  name?: string; stockOk?: boolean;
}

export interface Order {
  id: string; clientId: string;
  status: string; priority?: string;
  date: string; items: OrderItem[];
  total: number; notes?: string;
  deliveryDate?: string;
}
