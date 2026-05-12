import { Repository } from '@/shared/domain/repositories/Repository';

export class DispatchRepository extends Repository {
  async findByOrderId() {
    throw new Error('DispatchRepository adapter must implement findByOrderId');
  }

  async markDelivered() {
    throw new Error('DispatchRepository adapter must implement markDelivered');
  }
}
