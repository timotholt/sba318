import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { db } from '../database/database.js';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
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
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
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
  async findById(userId) {
    return await db.getEngine().findOne(User, { userId });
  },

  async findOne(query) {
    return await db.getEngine().findOne(User, query);
  },

  async findAll() {
    return await db.getEngine().find(User, {});
  },

  async create(userData) {
    // Ensure userId is generated if not provided
    if (!userData.userId) {
      userData.userId = crypto.randomUUID();
    }

    // Ensure deleted is set to false
    userData.deleted = false;
    
    return await db.getEngine().create(User, userData);
  },

  async update(query, data) {
    return await db.getEngine().update(User, query, data);
  },

  async updateById(userId, data) {
    return await db.getEngine().update(User, { userId }, data);
  },

  async softDelete(userId) {
    return await db.getEngine().update(User, 
      { userId }, 
      { 
        deleted: true,
        deletedAt: new Date(),
        nickname: "Deleted User"
      }
    );
  },

  async delete(query) {
    return await db.getEngine().delete(User, query);
  },

  async deleteById(userId) {
    return await db.getEngine().delete(User, { userId });
  },

  async findActive(query) {
    return await db.getEngine().find(User, {
      ...query,
      deleted: { $ne: true }
    });
  },

  async findOneActive(query) {
    return await db.getEngine().findOne(User, {
      ...query,
      deleted: false
    });
  },

  async findByUsername(username) {
    return await db.getEngine().findOne(User, { username });
  }
};
