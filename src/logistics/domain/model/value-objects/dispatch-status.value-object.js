import { ValueObject } from '@/shared/domain/model/value-objects/value-object';

const DISPATCH_STATUSES = [
  'ready',
  'ready_for_operations',
  'ready_for_dispatch',
  'ready_for_route',
  'preparing',
  'in_transit',
  'in_route',
  'delivered',
  'cancelled',
  'delayed',
  'incident',
  'validating',
  'document_pending',
];

export class DispatchStatus extends ValueObject {
  constructor(value = 'ready') {
    if (!DISPATCH_STATUSES.includes(value)) {
      throw new Error(`Invalid dispatch status: ${value}`);
    }

    super(value);
  }

  canClose() {
    return ['in_transit', 'in_route'].includes(this.value);
  }
}
