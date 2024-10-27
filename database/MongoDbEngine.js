import { BaseDbEngine } from './BaseDbEngine.js';

export class MongoDbEngine extends BaseDbEngine {
  async find(collection, query) {
    return await collection.find(query);
  }

  async findOne(collection, query) {
    return await collection.findOne(query);
  }

  async create(collection, data) {
    const document = new collection(data);
    return await document.save();
  }

  async update(collection, query, data) {
    return await collection.updateOne(query, data);
  }

  async delete(collection, query) {
    return await collection.deleteOne(query);
  }
}