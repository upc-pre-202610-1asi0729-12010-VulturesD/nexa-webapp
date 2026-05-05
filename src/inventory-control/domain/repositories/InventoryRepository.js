import { Repository } from '@/shared/domain/repositories/Repository';

export class InventoryRepository extends Repository {
  async findLotsByProductId() {
    throw new Error('InventoryRepository adapter must implement findLotsByProductId');
  }

  async findMovements() {
    throw new Error('InventoryRepository adapter must implement findMovements');
  }
}
