import { baseApi } from './base-api';

/**
 * Mock API fallback used only until backend endpoints are available.
 * Returns response data to keep current application services unchanged.
 */
export class BaseEndpoint {
  constructor(endpointPath, api = baseApi, { useCoreBackend = false, fallbackEndpointPath = endpointPath } = {}) {
    this.api = api;
    this.http = api.http;
    this.fallbackHttp = api.fallbackHttp;
    this.coreHttp = api.coreHttp;
    this.endpointPath = endpointPath;
    this.fallbackEndpointPath = fallbackEndpointPath;
    this.useCoreBackend = useCoreBackend;
  }

  pathFor(client, suffix = '', endpointPath = this.endpointPath) {
    const baseUrl = client?.defaults?.baseURL || '';
    const path = `${endpointPath}${suffix}`;
    const baseAlreadyIncludesApi = baseUrl.replace(/\/+$/, '').endsWith('/api/v1');
    return baseAlreadyIncludesApi ? path.replace(/^\/api\/v1/, '') : path;
  }

  primaryHttp() {
    return this.useCoreBackend && this.api.coreBackendEnabled ? this.coreHttp : this.http;
  }

  shouldUseFallback() {
    if (!this.api.mockFallbackEnabled) return false;
    if (this.useCoreBackend && this.api.coreBackendEnabled) return true;
    return !this.api.usesLocalBaseUrl;
  }

  async request(operation, validate) {
    try {
      const data = await operation(this.primaryHttp(), this.endpointPath);
      if (!validate || validate(data)) return data;
      throw new Error(`Invalid API payload for ${this.endpointPath}`);
    } catch (primaryError) {
      if (!this.shouldUseFallback()) throw primaryError;
      const data = await operation(this.fallbackHttp, this.fallbackEndpointPath);
      if (!validate || validate(data)) return data;
      throw new Error(`Invalid local API payload for ${this.endpointPath}`);
    }
  }

  getAll() {
    return this.request(
      (client, endpointPath) => client.get(this.pathFor(client, '', endpointPath)).then(response => response.data),
      Array.isArray
    );
  }

  getById(id) {
    return this.request(
      (client, endpointPath) => client.get(this.pathFor(client, `/${id}`, endpointPath)).then(response => response.data),
      (data) => data && typeof data === 'object' && !Array.isArray(data)
    );
  }

  create(resource) {
    return this.request((client, endpointPath) => client.post(this.pathFor(client, '', endpointPath), resource).then(response => response.data));
  }

  update(id, resource) {
    return this.request((client, endpointPath) => client.put(this.pathFor(client, `/${id}`, endpointPath), resource).then(response => response.data));
  }

  patch(id, resource) {
    return this.request((client, endpointPath) => client.patch(this.pathFor(client, `/${id}`, endpointPath), resource).then(response => response.data));
  }

  delete(id) {
    return this.request((client, endpointPath) => client.delete(this.pathFor(client, `/${id}`, endpointPath)).then(response => response.data));
  }
}
