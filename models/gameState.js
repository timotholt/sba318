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
    type: String,  // This will store userId instead of username
    required: true
  },
  creatorNickname: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    default: 4
  },
  players: [{
    userId: String,  // Changed from username to userId
    nickname: String
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

  async findByCreator(userId) {
    return await db.getEngine().find(GameState, { creator: userId });
  },

  async create(gameData) {
    return await db.getEngine().create(GameState, {
      ...gameData,
      id: crypto.randomUUID(),
      players: [] // Initialize empty players array
    });
  },

  async update(query, data) {
    return await db.getEngine().update(GameState, query, data);
  },

  async delete(query) {
    return await db.getEngine().delete(GameState, query);
  },

  async addPlayer(gameId, userId, nickname) {
    const game = await this.findOne({ id: gameId });
    if (!game) return null;

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (!game.players.find(p => p.userId === userId)) {
      game.players.push({ userId, nickname });
      await this.update({ id: gameId }, { players: game.players });
    }
    return game;
  },

  async removePlayer(gameId, userId) {
    const game = await this.findOne({ id: gameId });
    if (!game) return null;

    game.players = game.players.filter(p => p.userId !== userId);
    await this.update({ id: gameId }, { players: game.players });
    return game;
  },

  async isPlayerInGame(gameId, userId) {
    const game = await this.findOne({ id: gameId });
    return game ? game.players.some(p => p.userId === userId) : false;
  },

  async updatePlayerNickname(userId, newNickname) {
    const games = await this.findAll();
    for (const game of games) {
      const player = game.players.find(p => p.userId === userId);
      if (player) {
        player.nickname = newNickname;
        await this.update({ id: game.id }, { players: game.players });
      }
      if (game.creator === userId) {
        await this.update({ id: game.id }, { creatorNickname: newNickname });
      }
    }
  }
};



// import mongoose from 'mongoose';
// import { db } from '../database/database.js';
// import crypto from 'crypto';

// const gameStateSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 1
//   },
//   creator: {
//     type: String,
//     required: true
//   },
//   creatorNickname: {
//     type: String,
//     required: true
//   },
//   maxPlayers: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 4,
//     default: 4
//   },
//   players: [{
//     type: String
//   }],
//   playerNicknames: [{
//     type: String
//   }],
//   created: {
//     type: Date,
//     default: Date.now
//   }
// });

// export const GameState = mongoose.model('GameState', gameStateSchema);

// export const GameStateDB = {
//   async findAll() {
//     return await db.getEngine().find(GameState, {});
//   },

//   async findOne(query) {
//     return await db.getEngine().findOne(GameState, query);
//   },

//   async create(gameData) {
//     return await db.getEngine().create(GameState, {
//       ...gameData,
//       // id: Date.now().toString()
//       id: crypto.randomUUID()
//     });
//   },

//   async update(query, data) {
//     return await db.getEngine().update(GameState, query, data);
//   },

//   async delete(query) {
//     return await db.getEngine().delete(GameState, query);
//   }
// };