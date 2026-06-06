import { Order } from '@/sales/domain/model/entities/purchase-order.entity';
import { OrderResource } from './purchase-order.resource';

export const OrderAssembler = {
  toEntity(resource) {
    if (!resource) return null;
    return new Order(resource);
  },

  toResource(entity) {
    if (!entity) return null;
    return new OrderResource({
      id: entity.id,
      clientId: entity.clientId,
      status: entity.status.value,
      priority: entity.priority,
      date: entity.date,
      items: entity.items.map(item => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        stockOk: item.stockOk,
      })),
      total: entity.total,
      notes: entity.notes,
    });
  },
};
