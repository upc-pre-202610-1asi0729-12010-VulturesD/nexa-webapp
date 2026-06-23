export interface Product {
  id: string; name: string; sku: string;
  backendId?: number;
  category: string; cat?: string;
  temp?: string; unit?: string;
  price: number; stock: number; reserved?: number; minStock?: number;
  warehouse?: string; zone?: string; status?: string;
  imageUrl?: string; brand?: string; brandName?: string;
  coldType?: string; temperatureRange?: string;
  commercialAvailability?: string; isVisibleToBuyer?: boolean;
  description?: string; weightKg?: number; knowledge?: string;
  catalogItemId?: string; productId?: string;
}

export interface Category { id: string; name: string; cat?: string; }
