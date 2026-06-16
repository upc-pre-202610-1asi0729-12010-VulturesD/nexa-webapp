import { baseApi } from './base-api';

/**
 * Endpoint adapter for Nexa backend resources.
 * Optional fallback stays disabled unless a caller opts in explicitly.
 */
export class BaseEndpoint {
  constructor(endpointPath, api = baseApi, { useCoreBackend = true } = {}) {
    this.api = api;
    this.http = api.http;
    this.coreHttp = api.coreHttp;
    this.endpointPath = endpointPath;
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

  primaryEndpointPath() {
    return this.endpointPath;
  }

  async request(operation, validate) {
    const data = await operation(this.primaryHttp(), this.primaryEndpointPath());
    if (!validate || validate(data)) return data;
    throw new Error(`Invalid API payload for ${this.endpointPath}`);
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
