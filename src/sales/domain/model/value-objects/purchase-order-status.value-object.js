import { ValueObject } from '@/shared/domain/model/value-objects/value-object';

const ORDER_STATUS_FLOW = ['validating', 'confirmed', 'preparing', 'dispatched', 'delivered'];
const ALLOWED_STATUSES = [...ORDER_STATUS_FLOW, 'blocked', 'cancelled'];

export class OrderStatus extends ValueObject {
  constructor(value = 'validating') {
    if (!ALLOWED_STATUSES.includes(value)) {
      throw new Error(`Invalid order status: ${value}`);
    }

    super(value);
  }

  canTransitionTo(nextStatus) {
    if (this.value === nextStatus) return true;
    if (['blocked', 'cancelled', 'delivered'].includes(this.value)) return false;

    const currentIndex = ORDER_STATUS_FLOW.indexOf(this.value);
    const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus);
    return nextIndex === currentIndex + 1 || ['blocked', 'cancelled'].includes(nextStatus);
  }
}
