import { Entity } from '@/shared/domain/model/entities/entity';
import { roundMoney } from '@/shared/utils/number.utils';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../value-objects/purchase-order-status.value-object';

export class Order extends Entity {
  constructor({
    id,
    backendId,
    code,
    clientId,
    customerName,
    status = 'validating',
    priority = 'medium',
    date,
    currency = 'PEN',
    items = [],
    total = 0,
    notes = '',
    paymentConfirmation,
    inventoryReservation,
    rejectionReason,
    confirmedAt,
  } = {}) {
    super({ id });
    this.backendId = backendId;
    this.code = code || id;
    this.clientId = clientId;
    this.customerName = customerName;
    this.status = new OrderStatus(status);
    this.priority = priority;
    this.date = date;
    this.currency = currency;
    this.items = items.map(item => item instanceof OrderItem ? item : new OrderItem(item));
    this.total = total || this.calculateTotal();
    this.notes = notes;
    this.paymentConfirmation = paymentConfirmation;
    this.inventoryReservation = inventoryReservation;
    this.rejectionReason = rejectionReason;
    this.confirmedAt = confirmedAt;
  }

  calculateTotal() {
    return roundMoney(this.items.reduce((sum, item) => sum + item.lineTotal(), 0));
  }

  hasStockIssues() {
    return this.items.some(item => !item.hasEnoughStock());
  }

  canBeDispatched() {
    return ['confirmed', 'preparing'].includes(this.status.value) && !this.hasStockIssues();
  }

  changeStatus(nextStatus) {
    const next = new OrderStatus(nextStatus);
    if (!this.status.canTransitionTo(next.value)) {
      throw new Error(`Invalid order status transition: ${this.status.value} to ${next.value}`);
    }

    this.status = next;
  }
}
