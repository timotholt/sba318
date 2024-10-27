import express from 'express';
import { GameStateDB } from '../models/GameState.js';
import { UserDB } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] GET / - Fetching all games`);

    try {
        const games = await GameStateDB.findAll();
        
        // Enhance games with player nicknames
        const gamesWithNicknames = await Promise.all(games.map(async game => {
            const playerNicknames = await Promise.all(game.players.map(async username => {
                const user = await UserDB.findOne({ username });
                return user?.nickname || username;
            }));
            
            return {
                ...game,
                playerNicknames
            };
        }));

        console.log(`[${timestamp}] Total games: ${games.length}`);
        res.json(gamesWithNicknames);
    } catch (error) {
        console.error(`[${timestamp}] Error fetching games:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve games'
        });
    }
});

// Create a new game
router.post('/', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST / - Parameters:`, {
        name: req.body.name,
        creator: req.body.creator,
        maxPlayers: req.body.maxPlayers
    });

    try {
        const { name, creator, maxPlayers } = req.body;
        
        if (!name || !creator) {
            console.log(`[${timestamp}] Game creation failed: Missing required fields`);
            return res.status(400).json({
                success: false,
                message: 'Game name and creator are required'
            });
        }

        // Validate maxPlayers
        const maxPlayersNum = parseInt(maxPlayers) || 4;
        if (maxPlayersNum < 1 || maxPlayersNum > 4) {
            return res.status(400).json({
                success: false,
                message: 'Max players must be between 1 and 4'
            });
        }

        const existingGame = await GameStateDB.findOne({ name: name });
        
        if (existingGame) {
            console.log(`[${timestamp}] Game creation failed: Game name "${name}" already exists`);
            return res.status(400).json({
                success: false,
                message: 'A game with this name already exists'
            });
        }

        // Get the creator's nickname
        const creatorUser = await UserDB.findOne({ username: creator });
        if (!creatorUser) {
            console.log(`[${timestamp}] Game creation failed: Creator ${creator} not found`);
            return res.status(400).json({
                success: false,
                message: 'Creator not found'
            });
        }

        const newGame = await GameStateDB.create({
            name,
            creator,
            creatorNickname: creatorUser.nickname,
            maxPlayers: maxPlayersNum,
            players: [],           // Changed: Don't auto-add creator
            playerNicknames: []    // Changed: Don't auto-add creator's nickname
        });

        console.log(`[${timestamp}] New game created:`, newGame);
        res.json({ success: true, game: newGame });
    } catch (error) {
        console.error(`[${timestamp}] Error creating game:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to create game'
        });
    }
});

// Join a game
router.post('/:id/join', async (req, res) => {
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
            console.log(`[${timestamp}] Join game failed: Game ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.players.includes(username)) {
            console.log(`[${timestamp}] Join game: User ${username} already in game ${id}`);
            return res.json({ success: true, game });
        }

        // Check if game is full
        if (game.players.length >= game.maxPlayers) {
            console.log(`[${timestamp}] Join game failed: Game ${id} is full`);
            return res.status(400).json({
                success: false,
                message: 'Game is full'
            });
        }

        // Get the joining player's nickname
        const joiningUser = await UserDB.findOne({ username });
        if (!joiningUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
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
        console.error(`[${timestamp}] Error joining game:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to join game'
        });
    }
});

// Leave a game
router.post('/:id/leave', async (req, res) => {
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
            console.log(`[${timestamp}] Leave game failed: Game ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const playerIndex = game.players.indexOf(username);
        if (playerIndex === -1) {
            console.log(`[${timestamp}] Leave game failed: User ${username} not in game ${id}`);
            return res.status(400).json({
                success: false,
                message: 'User not in game'
            });
        }

        // Remove player and their nickname
        game.players.splice(playerIndex, 1);
        game.playerNicknames.splice(playerIndex, 1);
        
        await GameStateDB.update({ id }, { 
            players: game.players,
            playerNicknames: game.playerNicknames
        });
        
        console.log(`[${timestamp}] User ${username} left game ${id} successfully`);
        res.json({ success: true, game });
    } catch (error) {
        console.error(`[${timestamp}] Error leaving game:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave game'
        });
    }
});

// Delete a game
router.delete('/:id', async (req, res) => {
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
            console.log(`[${timestamp}] Game deletion failed: Username not provided`);
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }

        const { id } = req.params;
        const game = await GameStateDB.findOne({ id });
        
        if (!game) {
            console.log(`[${timestamp}] Game deletion failed: Game ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.creator !== username) {
            console.log(`[${timestamp}] Game deletion failed: User ${username} is not the creator of game ${id}`);
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete the game'
            });
        }

        await GameStateDB.delete({ id });
        console.log(`[${timestamp}] Game deleted successfully:`, game);
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Error deleting game:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete game'
        });
    }
});

export { router };