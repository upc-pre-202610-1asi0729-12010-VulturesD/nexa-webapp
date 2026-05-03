export interface WarehouseZone {
  id?: string; name: string; temp?: string;
  capacity?: number; used?: number; tempOk?: boolean;
}

export interface Warehouse {
  id: string; name: string; address?: string;
  zones?: WarehouseZone[];
}

export interface InventoryLot {
  id: string; productId: string;
  qty: number; reserved?: number;
  expiry?: string; entryDate?: string;
  status?: string; warehouse?: string; zone?: string;
}

export interface StockMovement {
  id: string; date: string;
  type: string; productId?: string;
  lotId?: string; qty: number;
  orderId?: string; note?: string; user?: string;
}
