export class OrderResource {
  constructor({
    id,
    backendId,
    code,
    clientId,
    customerName,
    status,
    priority,
    date,
    currency,
    items = [],
    total,
    notes,
    paymentConfirmation,
    inventoryReservation,
    rejectionReason,
    confirmedAt,
  } = {}) {
    this.id = id;
    this.backendId = backendId;
    this.code = code || id;
    this.clientId = clientId;
    this.customerName = customerName;
    this.status = status;
    this.priority = priority;
    this.date = date;
    this.currency = currency;
    this.items = items;
    this.total = total;
    this.notes = notes;
    this.paymentConfirmation = paymentConfirmation;
    this.inventoryReservation = inventoryReservation;
    this.rejectionReason = rejectionReason;
    this.confirmedAt = confirmedAt;
  }
}
