import { BaseDbEngine } from './BaseDbEngine.js';

export class MongoDbEngine extends BaseDbEngine {
  async find(collection, query) {
    // Support both simple queries and complex userId lookups
    const result = await collection.find(query);

    // Add support for chaining and custom sorting
    return {
      sort: (sortCriteria) => {
        if (typeof sortCriteria === 'function') {
          // For custom sort functions, we need to get all results first
          return result.toArray().then(docs => {
            docs.sort(sortCriteria);
            return {
              limit: (n) => docs.slice(0, n)
            };
          });
        }
        // MongoDB native sorting
        return result.sort(sortCriteria);
      },
      limit: (n) => result.limit(n),
      then: (resolve) => result.toArray().then(resolve)
    };
  }

  async findOne(collection, query) {
    return await collection.findOne(query);
  }

  async create(collection, data) {
    const document = new collection(data);
    return await document.save();
  }

  async update(collection, query, data) {
    // Support updating multiple documents
    return await collection.updateMany(query, { $set: data });
  }

  async delete(collection, query) {
    return await collection.deleteOne(query);
  }

  // Helper method to clear all data (useful for testing)
  async clear(collection) {
    return await collection.deleteMany({});
  }

  // Helper method to get collection size
  async count(collection, query = {}) {
    return await collection.countDocuments(query);
  }

  // Helper method for complex aggregations
  async aggregate(collection, pipeline) {
    return await collection.aggregate(pipeline).toArray();
  }

  // Helper method for transactions
  async withTransaction(callback) {
    const session = await collection.startSession();
    try {
      await session.withTransaction(callback);
    } finally {
      await session.endSession();
    }
  }
}


// import { BaseDbEngine } from './BaseDbEngine.js';

// export class MongoDbEngine extends BaseDbEngine {
//   async find(collection, query) {
//     return await collection.find(query);
//   }

//   async findOne(collection, query) {
//     return await collection.findOne(query);
//   }

//   async create(collection, data) {
//     const document = new collection(data);
//     return await document.save();
//   }

//   async update(collection, query, data) {
//     return await collection.updateOne(query, data);
//   }

//   async delete(collection, query) {
//     return await collection.deleteOne(query);
//   }
// }