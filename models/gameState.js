import mongoose from 'mongoose';
import { db } from '../database/database.js';
import crypto from 'crypto';

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
    type: String,  // This stores userId
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    default: 4
  },
  password: {
    type: String,
    default: ''
  },
  players: [{
    type: String  // Array of userIds
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
      id: crypto.randomUUID(),
      players: []
    });
  },

  async update(query, data) {
    return await db.getEngine().update(GameState, query, data);
  },

  async delete(query) {
    return await db.getEngine().delete(GameState, query);
  },

  async findByCreator(userId) {
    return await db.getEngine().find(GameState, { creator: userId });
  },

  async addPlayer(gameId, userId) {
    const game = await this.findOne({ id: gameId });
    if (!game) return null;

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (!game.players.includes(userId)) {
      game.players.push(userId);
      await this.update({ id: gameId }, { players: game.players });
    }
    return game;
  },

  async removePlayer(gameId, userId) {
    const game = await this.findOne({ id: gameId });
    if (!game) return null;

    game.players = game.players.filter(id => id !== userId);
    await this.update({ id: gameId }, { players: game.players });
    return game;
  },

  async isPlayerInGame(gameId, userId) {
    const game = await this.findOne({ id: gameId });
    return game ? game.players.includes(userId) : false;
  }
};