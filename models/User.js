import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { db } from '../database/database.js';

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

export const UserDB = {
  async findOne(query) {
    return await db.getEngine().findOne(User, query);
  },

  async findAll() {
    return await db.getEngine().find(User, {});
  },

  async create(userData) {
    return await db.getEngine().create(User, userData);
  },

  async update(query, data) {
    return await db.getEngine().update(User, query, data);
  },

  async delete(query) {
    return await db.getEngine().delete(User, query);
  }
};