import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

/**
 * Customers API service.
 *
 * @summary Provides HTTP operations for client resources.
 * @class CustomersApiService
 */
class CustomersApiService {
  constructor() {
    this.clients = new BaseEndpoint('/clients');
  }

  /**
   * @summary Gets all clients.
   * @returns {Promise<Array>}
   */
  getClients() {
    return this.clients.getAll();
  }

  /**
   * @summary Gets a single client by ID.
   * @param {string} id - Client identifier.
   * @returns {Promise<Object>}
   */
  getClientById(id) {
    return this.clients.getById(id);
  }
}

export const customersApiService = new CustomersApiService();
