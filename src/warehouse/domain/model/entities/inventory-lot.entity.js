import { Entity } from '@/shared/domain/model/entities/entity';
import { daysBetween, isExpired, isWithinDays } from '@/shared/utils/date.utils';
import { toNumber } from '@/shared/utils/number.utils';

export class InventoryLot extends Entity {
  constructor({
    id,
    productId,
    qty = 0,
    reserved = 0,
    expiry,
    entryDate,
    status = 'ok',
    warehouse,
    zone,
    catalogItemId,
    minimumTemperature,
    maximumTemperature,
  } = {}) {
    super({ id });
    this.productId = productId;
    this.qty = toNumber(qty);
    this.reserved = toNumber(reserved);
    this.expiry = expiry;
    this.entryDate = entryDate;
    this.status = status;
    this.warehouse = warehouse;
    this.zone = zone;
    this.catalogItemId = catalogItemId;
    this.minimumTemperature = toNumber(minimumTemperature);
    this.maximumTemperature = toNumber(maximumTemperature);
  }

  availableQty() {
    return Math.max(this.qty - this.reserved, 0);
  }

  daysToExpiry(reference = new Date()) {
    return daysBetween(reference, this.expiry);
  }

  isExpired(reference = new Date()) {
    return isExpired(this.expiry, reference);
  }

  isExpiringSoon(days = 10, reference = new Date()) {
    return isWithinDays(this.expiry, days, reference);
  }
}
