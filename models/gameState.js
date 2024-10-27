import mongoose from 'mongoose';
import { db } from '../database/database.js';

const gameStateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  creator: {
    type: String,
    required: true
  },
  creatorNickname: {
    type: String,
    required: true
  },
  players: [{
    type: String
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

export const GameState = mongoose.model('GameState', gameStateSchema);

export const GameStateDB = {
  async findAll() {
    return await db.getEngine().find(GameState, {});
  },

  async findOne(query) {
    return await db.getEngine().findOne(GameState, query);
  },

  async create(gameData) {
    return await db.getEngine().create(GameState, {
      ...gameData,
      id: Date.now().toString()
    });
  },

  async update(query, data) {
    return await db.getEngine().update(GameState, query, data);
  },

  async delete(query) {
    return await db.getEngine().delete(GameState, query);
  }
};