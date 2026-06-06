import { Entity } from '@/shared/domain/model/entities/entity';
import { TemperatureRange } from '../value-objects/temperature-range.value-object';
import { toNumber } from '@/shared/utils/number.utils';

export class Product extends Entity {
  constructor({
    id,
    name,
    sku,
    category,
    cat,
    temp,
    unit,
    price = 0,
    stock = 0,
    reserved = 0,
    minStock = 0,
    warehouse,
    zone,
    status = 'ok',
  } = {}) {
    super({ id });
    this.name = name;
    this.sku = sku;
    this.category = category;
    this.cat = cat;
    this.temperatureRange = new TemperatureRange(temp);
    this.unit = unit;
    this.price = toNumber(price);
    this.stock = toNumber(stock);
    this.reserved = toNumber(reserved);
    this.minStock = toNumber(minStock);
    this.warehouse = warehouse;
    this.zone = zone;
    this.status = status;
  }

  availableStock() {
    return Math.max(this.stock - this.reserved, 0);
  }

  isAvailable() {
    return this.status !== 'out' && this.availableStock() > 0;
  }

  needsReplenishment() {
    return this.stock <= this.minStock || this.status === 'low';
  }
}
