import { inventoryApiService } from '../infrastructure/inventory-api';
import { InventoryLotAssembler } from '../infrastructure/inventory-lot.assembler';

const mapLotResource = (lot) => InventoryLotAssembler.toResource(InventoryLotAssembler.toEntity(lot));

/**
 * Inventory application use cases.
 *
 * @summary Exposes inventory operations for the presentation layer.
 */
export const inventoryApplication = {
  /**
   * @summary Returns all lots sorted by expiry date (FEFO).
   * @returns {Promise<Array>}
   */
  getLots() {
    return inventoryApiService.getLots().then(lots =>
      lots.map(mapLotResource).sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
    );
  },

  /**
   * @summary Returns lots expiring within the given number of days.
   * @param {number} [days=10]
   * @returns {Promise<Array>}
   */
  getExpiringLots(days = 10) {
    const today = new Date();
    return this.getLots().then(lots =>
      lots.filter(l => (new Date(l.expiry) - today) / 86400000 <= days)
    );
  },

  /**
   * @summary Returns all stock movements.
   * @returns {Promise<Array>}
   */
  getMovements() {
    return inventoryApiService.getMovements();
  },

  /**
   * @summary Returns all warehouses.
   * @returns {Promise<Array>}
   */
  getWarehouses() {
    return inventoryApiService.getWarehouses();
  },
};
