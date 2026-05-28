export class ClientResource {
  constructor({
    id,
    name,
    ruc,
    type,
    contact,
    phone,
    address,
    condition,
    creditLimit,
    creditUsed,
    status,
    lastOrder,
  } = {}) {
    this.id = id;
    this.name = name;
    this.ruc = ruc;
    this.type = type;
    this.contact = contact;
    this.phone = phone;
    this.address = address;
    this.condition = condition;
    this.creditLimit = creditLimit;
    this.creditUsed = creditUsed;
    this.status = status;
    this.lastOrder = lastOrder;
  }
}
