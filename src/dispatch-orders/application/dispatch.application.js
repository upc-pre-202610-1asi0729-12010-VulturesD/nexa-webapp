import { dispatchApiService } from '../infrastructure/dispatch-api.service';
import { DispatchAssembler } from '../infrastructure/dispatch-order.assembler';

const mapDispatchResource = (dispatch) => DispatchAssembler.toResource(DispatchAssembler.toEntity(dispatch));

/**
 * Dispatch application use cases.
 *
 * @summary Exposes dispatch operations for the presentation layer.
 */
export const dispatchApplication = {
  /**
   * @summary Returns all dispatches.
   * @returns {Promise<Array>}
   */
  getDispatches() {
    return dispatchApiService.getDispatches().then(dispatches => dispatches.map(mapDispatchResource));
  },

  /**
   * @summary Marks a dispatch as in transit.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  markInRoute(id) {
    return dispatchApiService.updateDispatch(id, { status: 'in_transit' }).then(mapDispatchResource);
  },

  /**
   * @summary Submits proof of delivery for a dispatch.
   * @param {string} id
   * @param {Object} payload - POD fields (tempArrival, notes, evidenceDone).
   * @returns {Promise<Object>}
   */
  submitProofOfDelivery(id, payload) {
    return dispatchApiService.updateDispatch(id, {
      status: 'delivered',
      evidenceDone: true,
      ...payload,
    }).then(mapDispatchResource);
  },
};
