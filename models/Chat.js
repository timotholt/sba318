// I coudldn't get MongooseDB to work so ignore it!

import mongoose from 'mongoose';
import { db } from '../database/database.js';

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lobby', 'game'],
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: function() { 
            return this.type === 'game'; 
        }
    },
    username: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    private: {
        type: Boolean,
        default: false
    },
    recipientId: {
        type: String,
        required: function() { 
            return this.private === true; 
        }
    }
});

export const Chat = mongoose.model('Chat', chatSchema);

export const ChatDB = {
    async findByType(type) {
        const messages = await db.getEngine().find(Chat, { type });
        return messages
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-100); // Get last 100 messages
    },

    async findByGame(gameId) {
        const messages = await db.getEngine().find(Chat, { 
            type: 'game',
            gameId 
        });
        return messages
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-100); // Get last 100 messages
    },

    async create(chatData) {
        return await db.getEngine().create(Chat, chatData);
    },

    async deleteByGame(gameId) {
        return await db.getEngine().delete(Chat, { 
            type: 'game',
            gameId 
        });
    },

    async markUserDeleted(userId) {
        return await db.getEngine().update(
            Chat,
            { userId },
            { deleted: true, nickname: "Deleted User" }
        );
    },

    async update(query, data) {
        return await db.getEngine().update(Chat, query, data);
    }
};
