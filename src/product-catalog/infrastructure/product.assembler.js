import { Product } from '@/product-catalog/domain/model/entities/product.entity';
import { ProductResource } from './product.resource';

export const ProductAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Product(resource);
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
    });
  },
};
