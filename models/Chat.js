import mongoose from 'mongoose';
import { db } from '../database/database.js';

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lobby', 'game'],
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
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const Chat = mongoose.model('Chat', chatSchema);

export const ChatDB = {
    // Changed sort order to ascending (oldest first)
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

    async update(query, data) {
        return await db.getEngine().update(Chat, query, data);
    }
};

// import mongoose from 'mongoose';
// import { db } from '../database/database.js';

// const chatSchema = new mongoose.Schema({
//     type: {
//         type: String,
//         enum: ['lobby', 'game'],
//         required: true
//     },
//     gameId: {
//         type: String,
//         required: function() { 
//             return this.type === 'game'; 
//         }
//     },
//     username: {
//         type: String,
//         required: true
//     },
//     nickname: {
//         type: String,
//         required: true
//     },
//     message: {
//         type: String,
//         required: true,
//         trim: true,
//         maxlength: 500
//     },
//     timestamp: {
//         type: Date,
//         default: Date.now
//     }
// });

// export const Chat = mongoose.model('Chat', chatSchema);

// export const ChatDB = {
//     // Changed sort order to ascending (oldest first)
//     async findByType(type) {
//         const messages = await db.getEngine().find(Chat, { type });
//         return messages
//             .sort((a, b) => a.timestamp - b.timestamp)
//             .slice(-100); // Get last 100 messages
//     },

//     async findByGame(gameId) {
//         const messages = await db.getEngine().find(Chat, { 
//             type: 'game',
//             gameId 
//         });
//         return messages
//             .sort((a, b) => a.timestamp - b.timestamp)
//             .slice(-100); // Get last 100 messages
//     },

//     async create(chatData) {
//         return await db.getEngine().create(Chat, chatData);
//     },

//     async deleteByGame(gameId) {
//         return await db.getEngine().delete(Chat, { 
//             type: 'game',
//             gameId 
//         });
//     }
// };