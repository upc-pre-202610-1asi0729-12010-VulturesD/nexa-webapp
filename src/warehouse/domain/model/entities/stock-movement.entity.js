import { Entity } from '@/shared/domain/model/entities/entity';
import { toNumber } from '@/shared/utils/number.utils';

export class StockMovement extends Entity {
  constructor({ id, date, type, productId, lotId, qty = 0, orderId = null, note = '', user = '' } = {}) {
    super({ id });
    this.date = date;
    this.type = type;
    this.productId = productId;
    this.lotId = lotId;
    this.qty = toNumber(qty);
    this.orderId = orderId;
    this.note = note;
    this.user = user;
  }

  isOutbound() {
    return this.type === 'salida' || this.qty < 0;
  }

  affectsOrder() {
    return Boolean(this.orderId);
  }
}
