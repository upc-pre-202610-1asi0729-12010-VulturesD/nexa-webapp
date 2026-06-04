import { Entity } from '@/shared/domain/model/entity';
import { roundMoney, toNumber } from '@/shared/utils/number.utils';

export class OrderItem extends Entity {
  constructor({ id, productId, qty = 0, price = 0, stockOk = true } = {}) {
    super({ id: id || productId });
    this.productId = productId;
    this.qty = toNumber(qty);
    this.price = toNumber(price);
    this.stockOk = Boolean(stockOk);
  }

  lineTotal() {
    return roundMoney(this.qty * this.price);
  }

  hasEnoughStock() {
    return this.stockOk;
  }
}
