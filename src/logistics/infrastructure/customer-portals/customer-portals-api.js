import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

export class CustomerPortalsApi {
  constructor() {
    this.portals = new BaseEndpoint('/api/v1/customer-portals', undefined, { useCoreBackend: false, useMockApi: true });
    this.requirements = new BaseEndpoint('/api/v1/portal-requirements', undefined, { useCoreBackend: false, useMockApi: true });
    this.uploadTasks = new BaseEndpoint('/api/v1/portal-upload-tasks', undefined, { useCoreBackend: false, useMockApi: true });
  }

  getPortals() { return this.portals.getAll(); }
  getRequirements() { return this.requirements.getAll(); }
  getUploadTasks() { return this.uploadTasks.getAll(); }
}
