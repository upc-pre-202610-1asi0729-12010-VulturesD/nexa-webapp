import http, { CORE_BACKEND_ENABLED, coreHttp } from './http';

/**
 * Shared API access point for bounded-context infrastructure services.
 */
export class BaseApi {
  constructor(client = http, backendClient = coreHttp) {
    this.client = client;
    this.backendClient = backendClient;
  }

  get http() {
    return this.client;
  }

  get coreHttp() {
    return this.backendClient;
  }

  get coreBackendEnabled() {
    return CORE_BACKEND_ENABLED;
  }
}

export const baseApi = new BaseApi();
