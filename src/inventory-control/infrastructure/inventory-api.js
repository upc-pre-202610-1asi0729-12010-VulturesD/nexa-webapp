import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint';

/**
 * Inventory API service.
 *
 * @summary Provides HTTP operations for inventory resources.
 * @class InventoryApiService
 */
class InventoryApiService {
  constructor() {
    this.lots = new BaseEndpoint('/api/v1/inventory-lots');
    this.movements = new BaseEndpoint('/api/v1/stock-movements');
    this.warehouses = new BaseEndpoint('/api/v1/warehouses');
  }

  /**
   * @summary Gets all inventory lots.
   * @returns {Promise<Array>}
   */
  getLots() {
    return this.lots.getAll();
  }

  /**
   * @summary Gets all stock movements.
   * @returns {Promise<Array>}
   */
  getMovements() {
    return this.movements.getAll();
  }

  /**
   * @summary Gets all warehouses.
   * @returns {Promise<Array>}
   */
  getWarehouses() {
    return this.warehouses.getAll();
  }
}

export const inventoryApiService = new InventoryApiService();
