export class RequestItem {
  constructor({ id = null, purchaseRequestId = null, productId = null, quantity = 1, unit = '', estimatedWeightKg = 0, notes = '' } = {}) {
    this.id = id;
    this.purchaseRequestId = purchaseRequestId;
    this.productId = productId;
    this.quantity = Number(quantity || 1);
    this.unit = unit;
    this.estimatedWeightKg = Number(estimatedWeightKg || 0);
    this.notes = notes;
  }
}
