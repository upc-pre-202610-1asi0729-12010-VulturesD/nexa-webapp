import { ValueObject } from '@/shared/domain/model/ValueObject';

const DISPATCH_STATUSES = ['ready', 'in_transit', 'delivered', 'cancelled'];

export class DispatchStatus extends ValueObject {
  constructor(value = 'ready') {
    if (!DISPATCH_STATUSES.includes(value)) {
      throw new Error(`Invalid dispatch status: ${value}`);
    }

    super(value);
  }

  canClose() {
    return this.value === 'in_transit';
  }
}
