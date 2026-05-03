import { ordersApiService } from '../infrastructure/orders-api.service';
import { OrderAssembler } from '../infrastructure/purchase-order.assembler';

const mapOrderResource = (order) => OrderAssembler.toResource(OrderAssembler.toEntity(order));

/**
 * Orders application use cases.
 *
 * @summary Exposes order operations for the presentation layer.
 */
export const ordersApplication = {
  /**
   * @summary Returns all orders.
   * @returns {Promise<Array>}
   */
  getOrders() {
    return ordersApiService.getOrders().then(orders => orders.map(mapOrderResource));
  },

  /**
   * @summary Returns orders belonging to a client.
   * @param {string} clientId
   * @returns {Promise<Array>}
   */
  getOrdersForClient(clientId) {
    return this.getOrders().then(orders => orders.filter(o => o.clientId === clientId));
  },

  /**
   * @summary Returns a single order by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getOrderById(id) {
    return ordersApiService.getOrderById(id).then(mapOrderResource);
  },

  /**
   * @summary Creates a new order.
   * @param {Object} order
   * @returns {Promise<Object>}
   */
  createOrder(order) {
    return ordersApiService.createOrder(order);
  },

  /**
   * @summary Updates the status of an order.
   * @param {string} id
   * @param {string} status
   * @returns {Promise<Object>}
   */
  updateOrderStatus(id, status) {
    return ordersApiService.updateOrder(id, { status }).then(mapOrderResource);
  },
};
