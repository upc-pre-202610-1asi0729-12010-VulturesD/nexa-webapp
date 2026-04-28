import http, { API_BASE_URL, LOCAL_API_BASE_URL, localHttp } from './http';

/**
 * Shared API access point for bounded-context infrastructure services.
 * Reuses the existing configured HTTP client to preserve TB1 fallback behavior.
 */
export class BaseApi {
  constructor(client = http, fallbackClient = localHttp) {
    this.client = client;
    this.fallbackClient = fallbackClient;
  }

  get http() {
    return this.client;
  }

  get fallbackHttp() {
    return this.fallbackClient;
  }

  get usesLocalBaseUrl() {
    return API_BASE_URL === LOCAL_API_BASE_URL;
  }
}

export const baseApi = new BaseApi();
