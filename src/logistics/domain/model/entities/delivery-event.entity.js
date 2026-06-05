export class DeliveryEvent {
  constructor({ id = null, dispatchOrderId = null, orderId = null, status = '', label = '', timestamp = '', visibleToBuyer = true } = {}) {
    this.id = id;
    this.dispatchOrderId = dispatchOrderId;
    this.orderId = orderId;
    this.status = status;
    this.label = label;
    this.timestamp = timestamp;
    this.visibleToBuyer = Boolean(visibleToBuyer);
  }
}
