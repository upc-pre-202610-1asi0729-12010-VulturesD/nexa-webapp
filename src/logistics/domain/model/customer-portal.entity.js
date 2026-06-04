export class CustomerPortal {
  constructor({ id = null, clientId = null, name = '', integrationStatus = 'manual', notes = '' } = {}) {
    this.id = id;
    this.clientId = clientId;
    this.name = name;
    this.integrationStatus = integrationStatus;
    this.notes = notes;
  }
}
