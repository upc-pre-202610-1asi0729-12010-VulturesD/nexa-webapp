import { baseApi } from './base-api';

/**
 * Small REST endpoint wrapper for Fake API resources.
 * Returns response data to keep current application services unchanged.
 */
export class BaseEndpoint {
  constructor(endpointPath, api = baseApi) {
    this.api = api;
    this.http = api.http;
    this.fallbackHttp = api.fallbackHttp;
    this.endpointPath = endpointPath;
  }

  pathFor(client, suffix = '') {
    const baseUrl = client?.defaults?.baseURL || '';
    const path = `${this.endpointPath}${suffix}`;
    const baseAlreadyIncludesApi = baseUrl.replace(/\/+$/, '').endsWith('/api/v1');
    return baseAlreadyIncludesApi ? path.replace(/^\/api\/v1/, '') : path;
  }

  async request(operation, validate) {
    try {
      const data = await operation(this.http);
      if (!validate || validate(data)) return data;
      throw new Error(`Invalid API payload for ${this.endpointPath}`);
    } catch (primaryError) {
      if (this.api.usesLocalBaseUrl) throw primaryError;
      const data = await operation(this.fallbackHttp);
      if (!validate || validate(data)) return data;
      throw new Error(`Invalid local API payload for ${this.endpointPath}`);
    }
  }

  getAll() {
    return this.request(
      (client) => client.get(this.pathFor(client)).then(response => response.data),
      Array.isArray
    );
  }

  getById(id) {
    return this.request(
      (client) => client.get(this.pathFor(client, `/${id}`)).then(response => response.data),
      (data) => data && typeof data === 'object' && !Array.isArray(data)
    );
  }

  create(resource) {
    return this.request((client) => client.post(this.pathFor(client), resource).then(response => response.data));
  }

  update(id, resource) {
    return this.request((client) => client.put(this.pathFor(client, `/${id}`), resource).then(response => response.data));
  }

  patch(id, resource) {
    return this.request((client) => client.patch(this.pathFor(client, `/${id}`), resource).then(response => response.data));
  }

  delete(id) {
    return this.request((client) => client.delete(this.pathFor(client, `/${id}`)).then(response => response.data));
  }
}
