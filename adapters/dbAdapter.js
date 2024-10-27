class DbAdapter {
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

class MongoDbAdapter extends DbAdapter {
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

class InMemoryDbAdapter extends DbAdapter {
  constructor() {
    super();
    this.storage = new Map();
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
    const newDocument = { ...data, _id: Date.now().toString() };
    collectionData.push(newDocument);
    return newDocument;
  }

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

export function getDbAdapter(type) {
  switch (type) {
    case 'mongodb':
      return new MongoDbAdapter();
    case 'memory':
      return new InMemoryDbAdapter();
    default:
      throw new Error(`Unknown database type: ${type}`);
  }
}