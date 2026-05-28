import { Repository } from '@/shared/domain/repositories/repository';

export class UserRepository extends Repository {
  async findByEmail() {
    throw new Error('UserRepository adapter must implement findByEmail');
  }
}
