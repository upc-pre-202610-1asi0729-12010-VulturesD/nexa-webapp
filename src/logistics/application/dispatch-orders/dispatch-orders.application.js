import { dispatchOrdersApiService } from '../../infrastructure/dispatch-orders/dispatch-orders-api';
import { DispatchAssembler } from '../../infrastructure/dispatch-orders/dispatch-order.assembler';

const mapDispatchOrderResource = (dispatchOrder) => DispatchAssembler.toResource(DispatchAssembler.toEntity(dispatchOrder));

/**
 * Dispatch order application use cases.
 *
 * @summary Exposes dispatch order operations for the presentation layer.
 */
export const dispatchOrdersApplication = {
  /**
   * @summary Returns all dispatch orders.
   * @returns {Promise<Array>}
   */
  getDispatchOrders() {
    return dispatchOrdersApiService.getDispatchOrders().then(dispatchOrders => dispatchOrders.map(mapDispatchOrderResource));
  },

  /**
   * @summary Marks a dispatch as in transit.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  markInRoute(id) {
    return dispatchOrdersApiService.updateDispatchOrder(id, { status: 'in_route' }).then(mapDispatchOrderResource);
  },

  /**
   * @summary Submits proof of delivery for a dispatch.
   * @param {string} id
   * @param {Object} payload - POD fields (tempArrival, notes, evidenceDone).
   * @returns {Promise<Object>}
   */
  submitProofOfDelivery(id, payload) {
    return dispatchOrdersApiService.updateDispatchOrder(id, {
      status: 'delivered',
      evidenceDone: true,
      ...payload,
    }).then(mapDispatchOrderResource);
  },
};
