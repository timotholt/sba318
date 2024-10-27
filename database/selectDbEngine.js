import { MongoDbEngine } from './MongoDbEngine.js';
import { InMemoryDbEngine } from './InMemoryDbEngine.js';

export function getDbEngine(type) {
  switch (type) {
    case 'mongodb':
      return new MongoDbEngine();
    case 'memory':
      return new InMemoryDbEngine();
    default:
      throw new Error(`Unknown database type: ${type}`);
  }
}