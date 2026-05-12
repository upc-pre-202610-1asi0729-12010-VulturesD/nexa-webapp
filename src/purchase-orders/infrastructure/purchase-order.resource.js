export class OrderResource {
  constructor({ id, clientId, status, priority, date, items = [], total, notes } = {}) {
    this.id = id;
    this.clientId = clientId;
    this.status = status;
    this.priority = priority;
    this.date = date;
    this.items = items;
    this.total = total;
    this.notes = notes;
  }
}
