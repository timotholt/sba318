import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getDbEngine } from '../database/selectDbEngine.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 30,
    default: function() {
      return this.username;
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

const db = getDbEngine(process.env.DB_TYPE || 'memory');

export const UserDB = {
  async findOne(query) {
    return await db.findOne(User, query);
  },

  async create(userData) {
    return await db.create(User, userData);
  },

  async update(query, data) {
    return await db.update(User, query, data);
  },

  async delete(query) {
    return await db.delete(User, query);
  }
};