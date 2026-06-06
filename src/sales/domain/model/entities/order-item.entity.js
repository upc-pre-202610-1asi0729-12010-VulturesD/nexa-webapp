import { Entity } from '@/shared/domain/model/entities/entity';
import { roundMoney, toNumber } from '@/shared/utils/number.utils';

export class OrderItem extends Entity {
  constructor({
    id,
    productId,
    catalogItemId,
    itemName,
    qty = 0,
    quantity,
    price = 0,
    unitPriceAmount,
    unitPriceCurrency = 'PEN',
    subtotal,
    stockOk = true,
  } = {}) {
    super({ id: id || productId });
    this.productId = productId;
    this.catalogItemId = catalogItemId;
    this.itemName = itemName;
    this.qty = toNumber(quantity ?? qty);
    this.price = toNumber(unitPriceAmount ?? price);
    this.unitPriceCurrency = unitPriceCurrency;
    this.subtotal = subtotal;
    this.stockOk = Boolean(stockOk);
  }

  lineTotal() {
    return roundMoney(this.qty * this.price);
  }

  hasEnoughStock() {
    return this.stockOk;
  }
}
