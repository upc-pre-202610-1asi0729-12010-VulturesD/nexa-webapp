import { ValueObject } from '@/shared/domain/model/value-objects/value-object';

const ORDER_STATUS_FLOW = [
  'pending',
  'submitted',
  'validating',
  'confirmed',
  'document_pending',
  'ready_for_dispatch',
  'ready_for_operations',
  'ready_for_route',
  'preparing',
  'dispatched',
  'in_route',
  'delivered',
];
const ALLOWED_STATUSES = [...ORDER_STATUS_FLOW, 'blocked', 'cancelled', 'rejected', 'incident', 'delayed'];

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
