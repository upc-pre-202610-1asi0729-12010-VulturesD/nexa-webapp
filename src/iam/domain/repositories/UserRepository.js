import { Repository } from '@/shared/domain/repositories/Repository';

export class UserRepository extends Repository {
  async findByEmail() {
    throw new Error('UserRepository adapter must implement findByEmail');
  }
}
