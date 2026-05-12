import { Repository } from '@/shared/domain/repositories/Repository';

export class OrderRepository extends Repository {
  async findByClientId() {
    throw new Error('OrderRepository adapter must implement findByClientId');
  }

  async updateStatus() {
    throw new Error('OrderRepository adapter must implement updateStatus');
  }
}
