import express from 'express';
import { games } from '../models/gameState.js';

const router = express.Router();

// Get all games
router.get('/', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] GET / - Fetching all games`);

    try {
        console.log(`[${timestamp}] Total games: ${games.length}`);
        games.forEach((game, index) => {
            console.log(`[${timestamp}] Game ${index + 1}:`, game);
        });
        res.json(games);
    } catch (error) {
        console.error(`[${timestamp}] Error fetching games:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve games'
        });
    }
});

// Create a new game
router.post('/', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST / - Parameters:`, {
        name: req.body.name,
        creator: req.body.creator
    });

    try {
        const { name, creator } = req.body;
        
        if (!name || !creator) {
            console.log(`[${timestamp}] Game creation failed: Missing required fields`);
            return res.status(400).json({
                success: false,
                message: 'Game name and creator are required'
            });
        }

        const newGame = {
            id: Date.now().toString(),
            name,
            creator,
            players: [creator],
            created: new Date().toISOString()
        };

        games.push(newGame);
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

// Delete a game
router.delete('/:id', (req, res) => {
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
        
        const gameIndex = games.findIndex(g => g.id === id);
        
        if (gameIndex === -1) {
            console.log(`[${timestamp}] Game deletion failed: Game ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (games[gameIndex].creator !== username) {
            console.log(`[${timestamp}] Game deletion failed: User ${username} is not the creator of game ${id}`);
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete the game'
            });
        }

        const deletedGame = games[gameIndex];
        games.splice(gameIndex, 1);
        console.log(`[${timestamp}] Game deleted successfully:`, deletedGame);
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Error deleting game:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete game'
        });
    }
});

// Join a game
router.post('/:id/join', (req, res) => {
    const timestamp = new Date().toISOString();
    const { username } = req.body;
    const { id } = req.params;

    console.log(`[${timestamp}] POST /${id}/join - Parameters:`, {
        id,
        username
    });

    try {
        const game = games.find(g => g.id === id);
        
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

        game.players.push(username);
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

export { router };