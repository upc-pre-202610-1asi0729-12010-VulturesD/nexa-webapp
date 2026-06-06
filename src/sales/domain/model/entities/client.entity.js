import { Entity } from '@/shared/domain/model/entities/entity';
import { toNumber } from '@/shared/utils/number.utils';

export class Client extends Entity {
  constructor({
    id,
    name,
    ruc,
    type,
    contact,
    phone,
    address,
    condition = 'cash',
    creditLimit = 0,
    creditUsed = 0,
    status = 'active',
    lastOrder = null,
  } = {}) {
    super({ id });
    this.name = name;
    this.ruc = ruc;
    this.type = type;
    this.contact = contact;
    this.phone = phone;
    this.address = address;
    this.condition = condition;
    this.creditLimit = toNumber(creditLimit);
    this.creditUsed = toNumber(creditUsed);
    this.status = status;
    this.lastOrder = lastOrder;
  }

  hasCreditLimit() {
    return this.creditLimit > 0;
  }

  availableCredit() {
    return Math.max(this.creditLimit - this.creditUsed, 0);
  }

  isObserved() {
    return this.status === 'observed';
  }

  isCreditExhausted() {
    return this.hasCreditLimit() && this.creditUsed >= this.creditLimit;
  }
}
