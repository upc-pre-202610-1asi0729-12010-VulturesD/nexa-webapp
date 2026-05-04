import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

/**
 * Dispatch API service.
 *
 * @summary Provides HTTP operations for dispatch resources.
 * @class DispatchApiService
 */
class DispatchApiService {
  constructor() {
    this.dispatches = new BaseEndpoint('/dispatches');
  }

  /**
   * @summary Gets all dispatches.
   * @returns {Promise<Array>}
   */
  getDispatches() {
    return this.dispatches.getAll();
  }

  /**
   * @summary Updates a dispatch record.
   * @param {string} id - Dispatch identifier.
   * @param {Object} payload - Fields to update.
   * @returns {Promise<Object>}
   */
  updateDispatch(id, payload) {
    return this.dispatches.patch(id, payload);
  }
}

export const dispatchApiService = new DispatchApiService();
