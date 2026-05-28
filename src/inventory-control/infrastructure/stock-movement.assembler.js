import { StockMovement } from '../domain/model/entities/stock-movement.entity';
import { StockMovementResource } from './stock-movement.resource';

export const StockMovementAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new StockMovement(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new StockMovementResource({
      id: entity.id,
      date: entity.date,
      type: entity.type,
      productId: entity.productId,
      lotId: entity.lotId,
      qty: entity.qty,
      orderId: entity.orderId,
      note: entity.note,
      user: entity.user,
    });
  },

  toEntities(resources = []) {
    return resources.map((r) => this.toEntity(r));
  },
};
