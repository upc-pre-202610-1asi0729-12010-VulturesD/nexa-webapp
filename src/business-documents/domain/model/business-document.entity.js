export class BusinessDocument {
  constructor({ id = null, orderId = null, clientId = null, type = '', label = '', status = 'pending', required = false, visibleToBuyer = false } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.clientId = clientId;
    this.type = type;
    this.label = label;
    this.status = status;
    this.required = Boolean(required);
    this.visibleToBuyer = Boolean(visibleToBuyer);
  }
}
