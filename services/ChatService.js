// services/ChatService.js
import { ChatDB } from '../models/Chat.js';
import { UserDB } from '../models/User.js';
import { GameStateDB } from '../models/GameState.js';
import { APIError } from '../middleware/errorHandling.js';

class ChatService {
    constructor() {
        // Private constructor prevents direct instantiation
        if (ChatService.instance) {
            return ChatService.instance;
        }
        ChatService.instance = this;
    }

    static getInstance() {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    async getLobbyMessages() {
        return await ChatDB.findByType('lobby');
    }

    async getGameMessages(gameId) {
        const game = await GameStateDB.findOne({ id: gameId });
        if (!game) {
            throw new APIError('Game not found', 404);
        }
        return await ChatDB.findByGame(gameId);
    }

    async getMessages(type, gameId = null) {
        if (!type || !['lobby', 'game'].includes(type)) {
            throw new APIError('Valid chat type (lobby/game) is required', 400);
        }

        if (type === 'lobby') {
            return await this.getLobbyMessages();
        } else {
            if (!gameId) {
                throw new APIError('Game ID is required for game chat', 400);
            }
            return await this.getGameMessages(gameId);
        }
    }

    async createMessage(type, userId, message, gameId = null) {
        if (!type || !['lobby', 'game'].includes(type)) {
            throw new APIError('Valid chat type (lobby/game) is required', 400);
        }

        if (!userId || !message) {
            throw new APIError('User ID and message are required', 400);
        }

        const user = await UserDB.findById(userId);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        if (message.length > 500) {
            throw new APIError('Message too long (max 500 characters)', 400);
        }

        if (type === 'game') {
            if (!gameId) {
                throw new APIError('Game ID is required for game chat', 400);
            }

            const game = await GameStateDB.findOne({ id: gameId });
            if (!game) {
                throw new APIError('Game not found', 404);
            }

            if (!await GameStateDB.isPlayerInGame(gameId, userId)) {
                throw new APIError('User is not in this game', 403);
            }
        }

        const chatMessage = await ChatDB.create({
            type,
            gameId: type === 'game' ? gameId : undefined,
            userId,
            username: user.username,
            nickname: user.nickname,
            message: message.trim(),
            timestamp: new Date()
        });

        return chatMessage;
    }

    async deleteGameChat(gameId, userId) {
        const game = await GameStateDB.findOne({ id: gameId });
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        if (game.creator !== userId) {
            throw new APIError('Only game creator can delete chat history', 403);
        }

        await ChatDB.deleteByGame(gameId);
    }

    async markUserMessagesAsDeleted(userId) {
        return await ChatDB.markUserDeleted(userId);
    }

    async updateUserNickname(userId, newNickname) {
        return await ChatDB.update(
            { userId },
            { nickname: newNickname }
        );
    }
}

export const chatService = ChatService.getInstance();