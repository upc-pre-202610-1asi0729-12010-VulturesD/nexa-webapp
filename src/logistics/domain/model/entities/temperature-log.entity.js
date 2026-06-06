export class TemperatureLog {
  constructor({ id = null, dispatchOrderId = null, orderId = null, temperatureC = null, status = 'ok', source = 'simulated', timestamp = '' } = {}) {
    this.id = id;
    this.dispatchOrderId = dispatchOrderId;
    this.orderId = orderId;
    this.temperatureC = temperatureC;
    this.status = status;
    this.source = source;
    this.timestamp = timestamp;
  }
}
