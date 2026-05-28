import { Warehouse } from '../domain/model/entities/warehouse.entity';
import { WarehouseResource } from './warehouse.resource';

export const WarehouseAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Warehouse(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new WarehouseResource({
      id: entity.id,
      name: entity.name,
      address: entity.address,
      zones: entity.zones,
    });
  },

  toEntities(resources = []) {
    return resources.map((r) => this.toEntity(r));
  },
};
