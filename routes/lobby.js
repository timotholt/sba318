import express from 'express';
import { GameStateDB } from '../models/GameState.js';
import { UserDB } from '../models/User.js';
import { APIError } from '../middleware/errorHandling.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const username = req.query.username; // Get optional username from query params
    
    console.log(`[${timestamp}] GET / - Fetching games${username ? ` for user ${username}` : ''}`);

    try {
        const games = await GameStateDB.findAll();
        
        // Filter games if username is provided
        const filteredGames = username 
            ? games.filter(game => 
                game.creator === username || 
                game.players.includes(username)
              )
            : games;
        
        // Get nicknames for filtered games only
        const gamesWithNicknames = await Promise.all(filteredGames.map(async game => {
            const playerNicknames = await Promise.all(game.players.map(async username => {
                const user = await UserDB.findOne({ username });
                return user?.nickname || username;
            }));
            
            return {
                ...game,
                playerNicknames
            };
        }));

        console.log(`[${timestamp}] Total games: ${gamesWithNicknames.length}`);
        res.json(gamesWithNicknames);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST / - Parameters:`, {
        name: req.body.name,
        creator: req.body.creator,
        maxPlayers: req.body.maxPlayers
    });

    try {
        const { name, creator, maxPlayers } = req.body;
        
        if (!name || !creator) {
            throw new APIError('Game name and creator are required', 400);
        }

        const maxPlayersNum = parseInt(maxPlayers) || 4;
        if (maxPlayersNum < 1 || maxPlayersNum > 4) {
            throw new APIError('Max players must be between 1 and 4', 400);
        }

        const existingGame = await GameStateDB.findOne({ name: name });
        
        if (existingGame) {
            throw new APIError('A game with this name already exists', 400);
        }

        const creatorUser = await UserDB.findOne({ username: creator });
        if (!creatorUser) {
            throw new APIError('Creator not found', 404);
        }

        const newGame = await GameStateDB.create({
            name,
            creator,
            creatorNickname: creatorUser.nickname,
            maxPlayers: maxPlayersNum,
            players: [],
            playerNicknames: []
        });

        console.log(`[${timestamp}] New game created:`, newGame);
        res.json({ success: true, game: newGame });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/join', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { username } = req.body;
    const { id } = req.params;

    console.log(`[${timestamp}] POST /${id}/join - Parameters:`, {
        id,
        username
    });

    try {
        const game = await GameStateDB.findOne({ id });
        
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        if (game.players.includes(username)) {
            return res.json({ success: true, game });
        }

        if (game.players.length >= game.maxPlayers) {
            throw new APIError('Game is full', 400);
        }

        const joiningUser = await UserDB.findOne({ username });
        if (!joiningUser) {
            throw new APIError('User not found', 404);
        }

        game.players.push(username);
        game.playerNicknames.push(joiningUser.nickname);
        
        await GameStateDB.update({ id }, { 
            players: game.players,
            playerNicknames: game.playerNicknames
        });
        
        console.log(`[${timestamp}] User ${username} joined game ${id} successfully`);
        res.json({ success: true, game });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/leave', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { username } = req.body;
    const { id } = req.params;

    console.log(`[${timestamp}] POST /${id}/leave - Parameters:`, {
        id,
        username
    });

    try {
        const game = await GameStateDB.findOne({ id });
        
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        const playerIndex = game.players.indexOf(username);
        if (playerIndex === -1) {
            throw new APIError('User not in game', 400);
        }

        game.players.splice(playerIndex, 1);
        game.playerNicknames.splice(playerIndex, 1);
        
        await GameStateDB.update({ id }, { 
            players: game.players,
            playerNicknames: game.playerNicknames
        });
        
        console.log(`[${timestamp}] User ${username} left game ${id} successfully`);
        res.json({ success: true, game });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const username = req.query.username;
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    console.log(`[${timestamp}] DELETE Request - Full URL: ${fullUrl}`);
    console.log(`[${timestamp}] DELETE /${req.params.id} - Parameters:`, {
        id: req.params.id,
        username: username
    });

    try {
        if (!username) {
            throw new APIError('Username is required', 400);
        }

        const { id } = req.params;
        const game = await GameStateDB.findOne({ id });
        
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        if (game.creator !== username) {
            throw new APIError('Only the creator can delete the game', 403);
        }

        await GameStateDB.delete({ id });
        console.log(`[${timestamp}] Game deleted successfully:`, game);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export { router };
