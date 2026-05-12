import { Entity } from '@/shared/domain/model/Entity';
import { roundMoney } from '@/shared/utils/number.utils';
import { OrderItem } from './OrderItem.entity';
import { OrderStatus } from '../value-objects/OrderStatus.value-object';

export class Order extends Entity {
  constructor({
    id,
    clientId,
    status = 'validating',
    priority = 'medium',
    date,
    items = [],
    total = 0,
    notes = '',
  } = {}) {
    super({ id });
    this.clientId = clientId;
    this.status = new OrderStatus(status);
    this.priority = priority;
    this.date = date;
    this.items = items.map(item => item instanceof OrderItem ? item : new OrderItem(item));
    this.total = total || this.calculateTotal();
    this.notes = notes;
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
