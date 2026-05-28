import { ValueObject } from '@/shared/domain/model/value-object';

const VALID_ROLE_KEYS = ['admin', 'commercial', 'logistics', 'buyer'];

export class RoleKey extends ValueObject {
  constructor(value = 'commercial') {
    if (!VALID_ROLE_KEYS.includes(value)) {
      throw new Error(`Invalid role key: ${value}`);
    }

    super(value);
  }

  canManageInventory() {
    return ['admin', 'logistics'].includes(this.value);
  }

  canManageOrders() {
    return ['admin', 'commercial', 'logistics'].includes(this.value);
  }
}
