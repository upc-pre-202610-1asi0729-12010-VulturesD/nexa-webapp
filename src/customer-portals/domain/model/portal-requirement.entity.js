export class PortalRequirement {
  constructor({ id = null, portalId = null, clientId = null, requiredDocumentTypes = [], requiresManualUpload = true } = {}) {
    this.id = id;
    this.portalId = portalId;
    this.clientId = clientId;
    this.requiredDocumentTypes = requiredDocumentTypes;
    this.requiresManualUpload = Boolean(requiresManualUpload);
  }
}
