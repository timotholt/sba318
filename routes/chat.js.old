import express from 'express';
import { ChatDB } from '../models/Chat.js';
import { UserDB } from '../models/User.js';
import { GameStateDB } from '../models/GameState.js';
import { APIError } from '../middleware/errorHandling.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Simplified get messages endpoint
router.get('/', async (req, res, next) => {
    const { type, gameId } = req.query;
    
    try {
        if (!type || !['lobby', 'game'].includes(type)) {
            throw new APIError('Valid chat type (lobby/game) is required', 400);
        }

        let messages;
        if (type === 'lobby') {
            messages = await ChatDB.findByType('lobby');
        } else {
            if (!gameId) {
                throw new APIError('Game ID is required for game chat', 400);
            }
            const game = await GameStateDB.findOne({ id: gameId });
            if (!game) {
                throw new APIError('Game not found', 404);
            }
            messages = await ChatDB.findByGame(gameId);
        }

        res.json(messages);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    const { type, gameId, username, message } = req.body;

    try {
        if (!type || !['lobby', 'game'].includes(type)) {
            throw new APIError('Valid chat type (lobby/game) is required', 400);
        }

        if (!username || !message) {
            throw new APIError('Username and message are required', 400);
        }
      
        const user = await UserDB.findOne({ username });
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

            if (!game.players.includes(username)) {
                throw new APIError('User is not in this game', 403);
            }
        }

        const chatMessage = await ChatDB.create({
            type,
            gameId: type === 'game' ? gameId : undefined,
            username,
            nickname: user.nickname,
            message: message.trim(),
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: chatMessage
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/game/:gameId', async (req, res, next) => {
    const { gameId } = req.params;

    try {
        const game = await GameStateDB.findOne({ id: gameId });
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        if (game.creator !== req.query.username) {
            throw new APIError('Only game creator can delete chat history', 403);
        }

        await ChatDB.deleteByGame(gameId);

        res.json({
            success: true,
            message: 'Chat history deleted'
        });
    } catch (error) {
        next(error);
    }
});

export { router };