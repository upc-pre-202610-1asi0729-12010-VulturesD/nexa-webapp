import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

/**
 * Orders API service.
 *
 * @summary Provides HTTP operations for order resources.
 * @class OrdersApiService
 */
class OrdersApiService {
  constructor() {
    this.orders = new BaseEndpoint('/orders');
  }

  /**
   * @summary Gets all orders.
   * @returns {Promise<Array>}
   */
  getOrders() {
    return this.orders.getAll();
  }

  /**
   * @summary Gets a single order by ID.
   * @param {string} id - Order identifier.
   * @returns {Promise<Object>}
   */
  getOrderById(id) {
    return this.orders.getById(id);
  }

  /**
   * @summary Creates a new order.
   * @param {Object} order - Order payload.
   * @returns {Promise<Object>} Created order.
   */
  createOrder(order) {
    return this.orders.create(order);
  }

  /**
   * @summary Updates an existing order.
   * @param {string} id - Order identifier.
   * @param {Object} payload - Fields to update.
   * @returns {Promise<Object>}
   */
  updateOrder(id, payload) {
    return this.orders.patch(id, payload);
  }
}

export const ordersApiService = new OrdersApiService();
