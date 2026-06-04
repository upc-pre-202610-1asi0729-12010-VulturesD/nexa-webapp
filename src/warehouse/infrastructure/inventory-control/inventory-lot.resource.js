export class InventoryLotResource {
  constructor({ id, productId, qty, reserved, expiry, entryDate, status, warehouse, zone } = {}) {
    this.id = id;
    this.productId = productId;
    this.qty = qty;
    this.reserved = reserved;
    this.expiry = expiry;
    this.entryDate = entryDate;
    this.status = status;
    this.warehouse = warehouse;
    this.zone = zone;
  }
}
