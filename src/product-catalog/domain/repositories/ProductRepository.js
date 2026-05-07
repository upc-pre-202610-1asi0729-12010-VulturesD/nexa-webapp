import { Repository } from '@/shared/domain/repositories/Repository';

export class ProductRepository extends Repository {
  async findAvailable() {
    throw new Error('ProductRepository adapter must implement findAvailable');
  }
}
