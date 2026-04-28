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
      (client) => client.get(this.endpointPath).then(response => response.data),
      Array.isArray
    );
  }

  getById(id) {
    return this.request(
      (client) => client.get(`${this.endpointPath}/${id}`).then(response => response.data),
      (data) => data && typeof data === 'object' && !Array.isArray(data)
    );
  }

  create(resource) {
    return this.request((client) => client.post(this.endpointPath, resource).then(response => response.data));
  }

  update(id, resource) {
    return this.request((client) => client.put(`${this.endpointPath}/${id}`, resource).then(response => response.data));
  }

  patch(id, resource) {
    return this.request((client) => client.patch(`${this.endpointPath}/${id}`, resource).then(response => response.data));
  }

  delete(id) {
    return this.request((client) => client.delete(`${this.endpointPath}/${id}`).then(response => response.data));
  }
}
