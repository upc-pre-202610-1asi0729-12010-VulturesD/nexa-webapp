import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';
import { baseApi } from '@/shared/infrastructure/base-api';

/**
 * Dispatch orders API service.
 *
 * @summary Provides HTTP operations for dispatch order resources.
 * @class DispatchOrdersApiService
 */
class DispatchOrdersApiService {
  constructor() {
    this.dispatchOrders = new BaseEndpoint('/api/v1/shipments', baseApi, { useCoreBackend: true });
  }

  /**
   * @summary Gets all dispatch orders.
   * @returns {Promise<Array>}
   */
  getDispatchOrders() {
    return this.dispatchOrders.getAll();
  }

  /**
   * @summary Updates a dispatch order record.
   * @param {string} id - Dispatch identifier.
   * @param {Object} payload - Fields to update.
   * @returns {Promise<Object>}
   */
  updateDispatchOrder(id, payload) {
    return this.dispatchOrders.patch(id, payload);
  }
}

export const dispatchOrdersApiService = new DispatchOrdersApiService();
