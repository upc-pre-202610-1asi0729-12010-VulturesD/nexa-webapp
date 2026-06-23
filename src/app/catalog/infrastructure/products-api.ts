import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { Category, Product } from '@app/catalog/domain/model';

interface PlatformProductResponse {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  supplierName: string;
  unitPrice: number;
  minCelsius?: number;
  maxCelsius?: number;
  handlingNotes?: string;
  imageUrl?: string;
  brand?: string;
  brandName?: string;
  active: boolean;
}

interface PlatformCategoryResponse {
  id: number;
  name: string;
  description?: string;
}

interface CatalogItemResponse {
  id: number;
  catalogItemId: string;
  productId: string;
  itemName: string;
  brandName?: string;
  categoryName?: string;
  description?: string;
  imageUrl?: string;
  unitPriceAmount?: number;
  unitPriceCurrency?: string;
  availableStock?: number;
  reservedStock?: number;
  coldChainRequirement?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<CatalogItemResponse[]>('api/v1/catalog-items').pipe(
      map((items) => items.map((item) => this.fromCatalogItem(item))),
      catchError(() =>
        this.http.get<PlatformProductResponse[]>('api/v1/products').pipe(
          map((items) => items.map((item) => this.fromPlatformProduct(item))),
        ),
      ),
    );
  }

  categories() {
    return this.http.get<PlatformCategoryResponse[]>('api/v1/categories').pipe(
      map((items) => items.map((item) => this.fromPlatformCategory(item))),
    );
  }

  private fromPlatformProduct(item: PlatformProductResponse): Product {
    return {
      id: String(item.id),
      backendId: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      cat: item.category.toLowerCase().replace(/\s+/g, '-'),
      temp: this.temperatureLabel(item),
      temperatureRange: this.temperatureLabel(item),
      coldType: this.temperatureLabel(item).includes('-') ? 'frozen' : 'chilled',
      unit: 'caja',
      price: Number(item.unitPrice ?? 0),
      stock: item.active ? 1 : 0,
      reserved: 0,
      minStock: 0,
      warehouse: item.supplierName,
      zone: item.handlingNotes ?? '',
      status: item.active ? 'ok' : 'out',
      imageUrl: item.imageUrl,
      brand: item.brandName ?? item.brand,
      brandName: item.brandName ?? item.brand,
      commercialAvailability: item.active ? 'Disponible' : 'Consultar',
      isVisibleToBuyer: item.active,
      description: item.description,
    };
  }

  private fromCatalogItem(item: CatalogItemResponse): Product {
    const category = item.categoryName || 'Catalog';
    const stock = Number(item.availableStock ?? 0);
    const temperatureRange = this.coldRequirementToRange(item.coldChainRequirement);
    return {
      id: item.productId,
      backendId: item.id,
      sku: item.productId,
      name: item.itemName,
      catalogItemId: item.catalogItemId,
      productId: item.productId,
      category,
      cat: this.categoryToCat(category),
      temp: temperatureRange,
      temperatureRange,
      coldType: this.coldRequirementToType(item.coldChainRequirement),
      unit: 'UN',
      price: Number(item.unitPriceAmount ?? 0),
      stock,
      reserved: Number(item.reservedStock ?? 0),
      minStock: Math.max(10, Math.round(stock * 0.2)),
      warehouse: 'Core backend',
      zone: category,
      status: this.statusForCatalogItem(item),
      imageUrl: this.localImageUrl(item.imageUrl),
      brand: item.brandName,
      brandName: item.brandName,
      commercialAvailability: item.isActive === false ? 'Inactive' : 'Available',
      isVisibleToBuyer: item.isActive !== false,
      description: item.description,
      weightKg: 1,
      knowledge: item.description,
    };
  }

  private fromPlatformCategory(item: PlatformCategoryResponse): Category {
    return {
      id: String(item.id),
      name: item.name,
      cat: item.name.toLowerCase().replace(/\s+/g, '-'),
    };
  }

  private temperatureLabel(item: PlatformProductResponse): string {
    if (item.minCelsius == null || item.maxCelsius == null) return '';
    return `${item.minCelsius}°C a ${item.maxCelsius}°C`;
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

  private statusForCatalogItem(item: CatalogItemResponse): string {
    if (item.isActive === false) return 'out';
    const available = Number(item.availableStock ?? 0);
    if (available <= 0) return 'out';
    if (available <= Math.max(10, Math.round(available * 0.2))) return 'low';
    return 'ok';
  }

  private localImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) return undefined;
    return imageUrl.startsWith('/catalog-items/') ? `/assets${imageUrl}` : imageUrl;
  }
}
