export class PurchaseRequest {
  constructor({ id = null, code = '', clientId = null, status = 'draft', priority = 'normal', items = [] } = {}) {
    this.id = id;
    this.code = code || id;
    this.clientId = clientId;
    this.status = status;
    this.priority = priority;
    this.items = items;
  }
}
