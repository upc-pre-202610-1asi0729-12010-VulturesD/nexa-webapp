export class CartItem {
  constructor({ productId, quantity = 1, unit = '', notes = '' } = {}) {
    this.productId = productId;
    this.quantity = Number(quantity || 1);
    this.unit = unit;
    this.notes = notes;
  }

  get isValid() {
    return Boolean(this.productId) && this.quantity > 0;
  }
}
