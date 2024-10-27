import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getDbEngine } from './selectDbEngine.js';

dotenv.config();

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.dbEngine = null;
    Database.instance = this;
  }

  async connect() {
    if (this.dbEngine) {
      return this.dbEngine;
    }

    const dbType = process.env.DB_TYPE || 'memory';
    this.dbEngine = getDbEngine(dbType);
    
    if (dbType === 'mongodb') {
      try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');

        mongoose.connection.on('error', err => {
          console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected. Attempting to reconnect...');
          setTimeout(() => this.connect(), 5000);
        });

      } catch (error) {
        console.error('MongoDB connection error:', error.message);
        setTimeout(() => this.connect(), 5000);
      }
    } else {
      console.log('Using in-memory database');
    }
    
    return this.dbEngine;
  }

  getEngine() {
    return this.dbEngine;
  }
}

export const db = new Database();