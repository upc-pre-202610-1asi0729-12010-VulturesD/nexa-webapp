import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class BusinessDocumentsApi {
  constructor() {
    this.documents = new BaseEndpoint('/api/v1/business-documents');
    this.portalTasks = new BaseEndpoint('/api/v1/portal-upload-tasks');
  }

  getDocuments() { return this.documents.getAll(); }
  patchDocument(id, payload) { return this.documents.patch(id, payload); }
  getPortalTasks() { return this.portalTasks.getAll(); }
}
