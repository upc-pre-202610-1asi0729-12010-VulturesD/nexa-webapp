import { InventoryLot } from '@/warehouse/domain/model/entities/inventory-lot.entity';
import { InventoryLotResource } from './inventory-lot.resource';

const fallbackEntryDate = '2026-06-06';
const fallbackExpiryDate = '2026-12-31';

const statusFor = (available = 0, reserved = 0) => {
  const availableQty = Number(available || 0) - Number(reserved || 0);
  if (availableQty <= 0) return 'out';
  if (availableQty <= 24) return 'low';
  return 'ok';
};

const normalizeBackendInventoryItem = (resource = {}) => {
  if (resource.availableQuantity === undefined) return resource;
  const warehouseLocation = resource.warehouseLocation || 'Core warehouse';

  return {
    id: resource.catalogItemId || `INV-${resource.id}`,
    backendId: resource.id,
    productId: resource.productId,
    catalogItemId: resource.catalogItemId,
    qty: Number(resource.availableQuantity || 0),
    reserved: Number(resource.reservedQuantity || 0),
    expiry: resource.expiry || resource.expirationDate || fallbackExpiryDate,
    entryDate: resource.entryDate || fallbackEntryDate,
    status: statusFor(resource.availableQuantity, resource.reservedQuantity),
    warehouse: warehouseLocation,
    zone: warehouseLocation,
    minimumTemperature: resource.minimumTemperature,
    maximumTemperature: resource.maximumTemperature,
    source: 'nexa-platform',
  };
};

export const InventoryLotAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new InventoryLot(normalizeBackendInventoryItem(resource));
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
      catalogItemId: entity.catalogItemId,
      minimumTemperature: entity.minimumTemperature,
      maximumTemperature: entity.maximumTemperature,
    });
  },
};
