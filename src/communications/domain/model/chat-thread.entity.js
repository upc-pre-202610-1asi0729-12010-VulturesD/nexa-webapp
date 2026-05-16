export class ChatThread {
  constructor({ id = null, requestId = null, orderId = null, clientId = null, title = '', status = 'open' } = {}) {
    this.id = id;
    this.requestId = requestId;
    this.orderId = orderId;
    this.clientId = clientId;
    this.title = title;
    this.status = status;
  }
}
