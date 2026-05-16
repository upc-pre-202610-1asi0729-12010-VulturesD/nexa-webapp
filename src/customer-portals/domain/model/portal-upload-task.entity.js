export class PortalUploadTask {
  constructor({ id = null, orderId = null, portalId = null, status = 'pending', assignedToUserId = null } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.portalId = portalId;
    this.status = status;
    this.assignedToUserId = assignedToUserId;
  }
}
