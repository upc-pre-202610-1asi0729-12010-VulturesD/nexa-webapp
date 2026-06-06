import { Repository } from '@/shared/domain/repositories/repository';

export class ProductRepository extends Repository {
  async findAvailable() {
    throw new Error('ProductRepository adapter must implement findAvailable');
  }
}
