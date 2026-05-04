export class DispatchResource {
  constructor({
    id,
    orderId,
    clientId,
    status,
    driver,
    vehicle,
    dest,
    tempExit,
    evidenceRequired,
    evidenceDone,
    checklist = [],
  } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.clientId = clientId;
    this.status = status;
    this.driver = driver;
    this.vehicle = vehicle;
    this.dest = dest;
    this.tempExit = tempExit;
    this.evidenceRequired = evidenceRequired;
    this.evidenceDone = evidenceDone;
    this.checklist = checklist;
  }
}
