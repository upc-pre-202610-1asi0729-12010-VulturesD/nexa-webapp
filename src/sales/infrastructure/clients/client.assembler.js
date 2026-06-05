import { Client } from '../../domain/model/client.entity';
import { ClientResource } from './client.resource';

export const ClientAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Client(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new ClientResource({
      id: entity.id,
      name: entity.name,
      ruc: entity.ruc,
      type: entity.type,
      contact: entity.contact,
      phone: entity.phone,
      address: entity.address,
      condition: entity.condition,
      creditLimit: entity.creditLimit,
      creditUsed: entity.creditUsed,
      status: entity.status,
      lastOrder: entity.lastOrder,
    });
  },

  toEntities(resources = []) {
    return resources.map((r) => this.toEntity(r));
  },
};
