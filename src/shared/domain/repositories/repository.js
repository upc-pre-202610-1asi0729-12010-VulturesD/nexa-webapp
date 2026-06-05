export class Repository {
  async findAll() {
    throw new Error('Repository adapter must implement findAll');
  }

  async findById() {
    throw new Error('Repository adapter must implement findById');
  }

  async save() {
    throw new Error('Repository adapter must implement save');
  }
}
