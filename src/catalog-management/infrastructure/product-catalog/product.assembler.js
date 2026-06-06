import { Product } from '@/catalog-management/domain/model/entities/product.entity';
import { ProductResource } from './product.resource';

const categoryToCat = (category = '') => ({
  Cheese: 'cheese',
  Charcuterie: 'charcuterie',
  Butter: 'butter',
  Dessert: 'dessert',
}[category] || String(category).toLowerCase().replace(/\s+/g, '-'));

const coldRequirementToType = (requirement = '') => {
  const normalized = String(requirement).toLowerCase();
  if (normalized.includes('frozen')) return 'frozen';
  if (normalized.includes('refrigerated')) return 'chilled';
  return 'ambient';
};

const coldRequirementToRange = (requirement = '') => {
  const normalized = String(requirement).toLowerCase();
  if (normalized.includes('frozen')) return '-18°C';
  if (normalized.includes('refrigerated')) return '2°C - 8°C';
  return 'Ambient';
};

const statusFor = (resource = {}) => {
  if (resource.isActive === false) return 'out';
  const available = Number(resource.availableStock ?? resource.stock ?? 0);
  if (available <= 0) return 'out';
  if (available <= Math.max(10, Math.round(available * 0.2))) return 'low';
  return 'ok';
};

const normalizeBackendCatalogItem = (resource = {}) => {
  if (!resource.catalogItemId) return resource;
  const stock = Number(resource.availableStock ?? 0);
  const category = resource.categoryName || 'Catalog';
  const coldType = coldRequirementToType(resource.coldChainRequirement);

  return {
    id: resource.productId,
    backendId: resource.id,
    catalogItemId: resource.catalogItemId,
    productId: resource.productId,
    name: resource.itemName,
    sku: resource.productId,
    category,
    cat: categoryToCat(category),
    temp: coldRequirementToRange(resource.coldChainRequirement),
    unit: 'UN',
    price: Number(resource.unitPriceAmount ?? 0),
    currency: resource.unitPriceCurrency || 'PEN',
    stock,
    reserved: Number(resource.reservedStock ?? 0),
    minStock: Math.max(10, Math.round(stock * 0.2)),
    warehouse: 'Core backend',
    zone: category,
    status: statusFor(resource),
    imageUrl: resource.imageUrl,
    brand: resource.brandName,
    brandName: resource.brandName,
    description: resource.description,
    coldType,
    commercialAvailability: resource.isActive === false ? 'Inactive' : 'Available',
    isVisibleToBuyer: resource.isActive !== false,
    visibleToBuyer: resource.isActive !== false,
    weightKg: 1,
    knowledge: resource.description,
    source: 'nexa-platform',
  };
};

export const ProductAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Product(normalizeBackendCatalogItem(resource));
  },

  toResource(entity) {
    if (!entity) return null;
    return new ProductResource({
      id: entity.id,
      name: entity.name,
      sku: entity.sku,
      category: entity.category,
      cat: entity.cat,
      temp: entity.temperatureRange.value,
      unit: entity.unit,
      price: entity.price,
      stock: entity.stock,
      reserved: entity.reserved,
      minStock: entity.minStock,
      warehouse: entity.warehouse,
      zone: entity.zone,
      status: entity.status,
      imageUrl: entity.imageUrl,
      brand: entity.brand,
      brandName: entity.brandName,
      description: entity.description,
      coldType: entity.coldType,
      commercialAvailability: entity.commercialAvailability,
      isVisibleToBuyer: entity.isVisibleToBuyer,
      visibleToBuyer: entity.visibleToBuyer,
      catalogItemId: entity.catalogItemId,
      productId: entity.productId,
      currency: entity.currency,
      weightKg: entity.weightKg,
      knowledge: entity.knowledge,
    });
  },
};
