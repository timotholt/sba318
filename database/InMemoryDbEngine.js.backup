import { BaseDbEngine } from './BaseDbEngine.js';

export class InMemoryDbEngine extends BaseDbEngine {
  constructor() {
    super();
    this.storage = new Map();
  }

  async find(collection, query) {
    const collectionData = this.storage.get(collection.modelName) || [];
    return collectionData.filter(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  }

  async findOne(collection, query) {
    const collectionData = this.storage.get(collection.modelName) || [];
    return collectionData.find(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  }

async create(collection, data) {
    const collectionName = collection.modelName;
    if (!this.storage.has(collectionName)) {
        this.storage.set(collectionName, []);
    }
    const collectionData = this.storage.get(collectionName);
    
    // Ensure dates are stored as Date objects
    const newDocument = { 
        ...data, 
        _id: Date.now().toString(),
        created: data.created ? new Date(data.created) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    };
    
    collectionData.push(newDocument);
    return newDocument;
}
  
  // async create(collection, data) {
  //   const collectionName = collection.modelName;
  //   if (!this.storage.has(collectionName)) {
  //     this.storage.set(collectionName, []);
  //   }
  //   const collectionData = this.storage.get(collectionName);
  //   const newDocument = { ...data, _id: Date.now().toString() };
  //   collectionData.push(newDocument);
  //   return newDocument;
  // }

  async update(collection, query, data) {
    const collectionData = this.storage.get(collection.modelName) || [];
    const index = collectionData.findIndex(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
    if (index !== -1) {
      collectionData[index] = { ...collectionData[index], ...data };
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async delete(collection, query) {
    const collectionData = this.storage.get(collection.modelName) || [];
    const initialLength = collectionData.length;
    const filtered = collectionData.filter(item => 
      !Object.entries(query).every(([key, value]) => item[key] === value)
    );
    this.storage.set(collection.modelName, filtered);
    return { deletedCount: initialLength - filtered.length };
  }
}