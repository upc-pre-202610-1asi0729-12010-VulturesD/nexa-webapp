import http, { API_BASE_URL, CORE_BACKEND_ENABLED, LOCAL_API_BASE_URL, MOCK_API_FALLBACK_ENABLED, coreHttp, localHttp, mockHttp } from './http';

/**
 * Shared API access point for bounded-context infrastructure services.
 * Reuses the existing configured HTTP client to preserve TB1 fallback behavior.
 */
export class BaseApi {
  constructor(client = http, fallbackClient = localHttp, backendClient = coreHttp) {
    this.client = client;
    this.fallbackClient = fallbackClient;
    this.backendClient = backendClient;
  }

  get http() {
    return this.client;
  }

  get fallbackHttp() {
    return this.fallbackClient;
  }

  get mockHttp() {
    return mockHttp;
  }

  get coreHttp() {
    return this.backendClient;
  }

  get coreBackendEnabled() {
    return CORE_BACKEND_ENABLED;
  }

  get mockFallbackEnabled() {
    return MOCK_API_FALLBACK_ENABLED;
  }

  get usesLocalBaseUrl() {
    return API_BASE_URL === LOCAL_API_BASE_URL;
  }
}

export const baseApi = new BaseApi();
