export interface WarehouseZone {
  id?: string; name: string; temp?: string;
  capacity?: number; used?: number; tempOk?: boolean;
}

export interface Warehouse {
  id: string | number; name: string; address?: string;
  zones?: WarehouseZone[];
}

export interface InventoryLot {
  backendId?: number; tenantId?: number; inventoryItemId?: number;
  id: string; productId: string;
  qty: number; reserved?: number;
  expiry?: string; entryDate?: string;
  status?: string; warehouse?: string; zone?: string;
  fefoPriority?: number;
  expirationDate?: string;
}

export interface StockMovement {
  backendId?: number; tenantId?: number; code?: string;
  id: string; date: string;
  type: string; productId?: string;
  lotId?: string; qty: number;
  inventoryItemId?: number; warehouse?: string;
  orderId?: string; reason?: string; note?: string; user?: string;
  temperatureReading?: number; createdAt?: string;
}

export interface CreateStockMovement {
  code?: string;
  inventoryItemId?: number;
  productId?: string;
  warehouse?: string;
  lotId?: string;
  type: string;
  quantity: number;
  orderId?: string;
  reason?: string;
  note?: string;
  temperatureReading?: number;
  user?: string;
  expirationDate?: string;
}
