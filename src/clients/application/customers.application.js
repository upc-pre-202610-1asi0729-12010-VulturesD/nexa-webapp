import { customersApiService } from '../infrastructure/customers-api.service';

/**
 * Customers application use cases.
 *
 * @summary Exposes client operations for the presentation layer.
 */
export const customersApplication = {
  /**
   * @summary Returns all clients.
   * @returns {Promise<Array>}
   */
  getClients() {
    return customersApiService.getClients();
  },

  /**
   * @summary Returns a single client by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getClientById(id) {
    return customersApiService.getClientById(id);
  },

  /**
   * @summary Returns only active clients.
   * @returns {Promise<Array>}
   */
  getActiveClients() {
    return customersApiService.getClients().then(clients =>
      clients.filter(c => c.status === 'active')
    );
  },
};
