export class StockMovementResource {
  constructor({ id, date, type, productId, lotId, qty, orderId, note, user } = {}) {
    this.id = id;
    this.date = date;
    this.type = type;
    this.productId = productId;
    this.lotId = lotId;
    this.qty = qty;
    this.orderId = orderId;
    this.note = note;
    this.user = user;
  }
}
