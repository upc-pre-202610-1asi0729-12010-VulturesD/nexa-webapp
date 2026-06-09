export class DispatchResource {
  constructor({
    id,
    backendId,
    code,
    orderId,
    clientId,
    status,
    column,
    priority,
    driver,
    driverName,
    vehicle,
    dest,
    tempExit,
    evidenceRequired,
    evidenceDone,
    checklist = [],
    routeName,
    eta,
    responsible,
    requiresPOD,
    documentProgress,
    coldType,
    lastTemperatureCelsius,
    scheduledAt,
    deliveredAt,
  } = {}) {
    this.id = id;
    this.backendId = backendId;
    this.code = code || id;
    this.orderId = orderId;
    this.clientId = clientId;
    this.status = status;
    this.column = column || status;
    this.priority = priority || 'normal';
    this.driver = driver;
    this.driverName = driverName || driver;
    this.vehicle = vehicle;
    this.dest = dest;
    this.tempExit = tempExit;
    this.evidenceRequired = evidenceRequired;
    this.evidenceDone = evidenceDone;
    this.checklist = checklist;
    this.routeName = routeName;
    this.eta = eta;
    this.responsible = responsible;
    this.requiresPOD = requiresPOD;
    this.documentProgress = documentProgress;
    this.coldType = coldType;
    this.lastTemperatureCelsius = lastTemperatureCelsius;
    this.scheduledAt = scheduledAt;
    this.deliveredAt = deliveredAt;
  }
}
