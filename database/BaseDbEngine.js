export class BaseDbEngine {
  async findOne(collection, query) {
    throw new Error('Method not implemented');
  }

  async create(collection, data) {
    throw new Error('Method not implemented');
  }

  async update(collection, query, data) {
    throw new Error('Method not implemented');
  }

  async delete(collection, query) {
    throw new Error('Method not implemented');
  }
}