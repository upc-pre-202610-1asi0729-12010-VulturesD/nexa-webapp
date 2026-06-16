import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class CustomerPortalsApi {
  constructor() {
    this.portals = new BaseEndpoint('/api/v1/customer-portals');
    this.requirements = new BaseEndpoint('/api/v1/portal-requirements');
    this.uploadTasks = new BaseEndpoint('/api/v1/portal-upload-tasks');
  }

  getPortals() { return this.portals.getAll(); }
  getRequirements() { return this.requirements.getAll(); }
  getUploadTasks() { return this.uploadTasks.getAll(); }
}
