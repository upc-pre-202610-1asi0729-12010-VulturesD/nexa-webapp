export interface Product {
  id: string; name: string; sku: string;
  category: string; cat?: string;
  temp?: string; unit?: string;
  price: number; stock: number; reserved?: number; minStock?: number;
  warehouse?: string; zone?: string; status?: string;
}

export interface Category { id: string; name: string; cat?: string; }
