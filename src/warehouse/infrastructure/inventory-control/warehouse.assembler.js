import { Warehouse } from '../../domain/model/entities/warehouse.entity';
import { WarehouseResource } from './warehouse.resource';

export const WarehouseAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    const range = `${Number(resource.minimumTemperature ?? 0)}°C - ${Number(resource.maximumTemperature ?? 0)}°C`;
    return new Warehouse({
      id: resource.id,
      name: resource.name,
      address: resource.location || resource.address,
      zones: resource.zones || [{
        id: `${resource.id}-main`,
        name: resource.location || resource.name,
        temp: range,
        capacity: 100,
        used: 0,
        tempOk: resource.isActive !== false,
      }],
    });
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
