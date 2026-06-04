import { InventoryLot } from '@/warehouse/domain/model/entities/inventory-lot.entity';
import { InventoryLotResource } from './inventory-lot.resource';

export const InventoryLotAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new InventoryLot(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new InventoryLotResource({
      id: entity.id,
      productId: entity.productId,
      qty: entity.qty,
      reserved: entity.reserved,
      expiry: entity.expiry,
      entryDate: entity.entryDate,
      status: entity.status,
      warehouse: entity.warehouse,
      zone: entity.zone,
    });
  },
};
