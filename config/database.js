import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getDbAdapter } from '../adapters/dbAdapter.js';

dotenv.config();

const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export async function connectDB() {
  const dbType = process.env.DB_TYPE || 'memory';
  const db = getDbAdapter(dbType);
  
  if (dbType === 'mongodb') {
    try {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, connectOptions);
      console.log('MongoDB connected successfully');

      mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(connectDB, 5000);
      });

    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      setTimeout(connectDB, 5000);
    }
  } else {
    console.log('Using in-memory database');
  }
  
  return db;
}